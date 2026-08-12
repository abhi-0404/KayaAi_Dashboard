/**
 * Site hierarchy authoring — the dashboard's half of the contract.
 *
 * The field app reads projects, levels and zones but never creates them, so
 * without this the database stays empty and every surface renders nothing. This
 * is the entry point for real data: a supervisor sets up the site here, and it
 * appears on the phones over Realtime.
 *
 * Ids are readable slugs rather than UUIDs because they show up in Glass Link
 * payloads, event references and support conversations, where `proj_meridian`
 * beats a random 36-character string.
 */
import { supabase } from "@/integrations/supabase/client";

export type Result<T = void> = { ok: true; data: T } | { ok: false; error: string };

function slug(input: string, fallback: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 28);
  return base || fallback;
}

/** Suffix keeps two sites with the same name from colliding on the primary key. */
function uniqueId(prefix: string, name: string) {
  return `${prefix}_${slug(name, "item")}_${Date.now().toString(36).slice(-4)}`;
}

export type NewProjectInput = {
  name: string;
  code: string;
  client: string;
  location: string;
  description: string;
  phase: string;
  /** Created alongside the project so the app has somewhere to point at once. */
  levels: { name: string; number: number; zones: string[] }[];
};

/**
 * Creates a project with its levels and zones.
 *
 * Written as sequential inserts with rollback on failure rather than one RPC:
 * a half-created site is worse than none, because the app would resolve context
 * to a level with no zones and quietly show an empty location.
 */
export async function createProject(input: NewProjectInput): Promise<Result<{ id: string }>> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return { ok: false, error: "Sign in before creating a project." };

  const projectId = uniqueId("proj", input.name);

  const project = await supabase.from("projects").insert({
    id: projectId,
    name: input.name.trim(),
    code: input.code.trim(),
    client: input.client.trim(),
    location: input.location.trim(),
    description: input.description.trim(),
    phase: input.phase.trim(),
    status: "active",
    progress: 0,
    created_by: userId,
  });
  if (project.error) return { ok: false, error: project.error.message };

  const rollback = async (message: string): Promise<Result<{ id: string }>> => {
    // Cascades take the levels and zones with it.
    await supabase.from("projects").delete().eq("id", projectId);
    return { ok: false, error: message };
  };

  let firstLevelId: string | null = null;

  for (const level of input.levels) {
    const levelId = uniqueId("lvl", `${input.name}_${level.name}`);
    const levelRow = await supabase.from("levels").insert({
      id: levelId,
      project_id: projectId,
      name: level.name.trim(),
      number: level.number,
      status: "in_progress",
    });
    if (levelRow.error) return rollback(levelRow.error.message);
    if (!firstLevelId) firstLevelId = levelId;

    for (const zoneName of level.zones) {
      if (!zoneName.trim()) continue;
      const zone = await supabase.from("zones").insert({
        id: uniqueId("zone", `${level.name}_${zoneName}`),
        project_id: projectId,
        level_id: levelId,
        name: zoneName.trim(),
        code: `${level.name.replace(/\s+/g, "")}-${zoneName.trim().slice(0, 4).toUpperCase()}`,
      });
      if (zone.error) return rollback(zone.error.message);
    }
  }

  if (firstLevelId) {
    await supabase.from("projects").update({ current_level_id: firstLevelId }).eq("id", projectId);
  }

  return { ok: true, data: { id: projectId } };
}

export async function updateProjectProgress(id: string, progress: number): Promise<Result> {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));
  const { error } = await supabase.from("projects").update({ progress: clamped }).eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true, data: undefined };
}

export async function archiveProject(id: string): Promise<Result> {
  // Status change rather than a delete: events and captures reference the
  // project, and losing that history to tidy a list is not a good trade.
  const { error } = await supabase.from("projects").update({ status: "completed" }).eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true, data: undefined };
}

export async function addLevel(
  projectId: string,
  name: string,
  number: number,
): Promise<Result<{ id: string }>> {
  const id = uniqueId("lvl", name);
  const { error } = await supabase
    .from("levels")
    .insert({ id, project_id: projectId, name: name.trim(), number, status: "in_progress" });
  return error ? { ok: false, error: error.message } : { ok: true, data: { id } };
}

export async function addZone(
  projectId: string,
  levelId: string,
  name: string,
): Promise<Result<{ id: string }>> {
  const id = uniqueId("zone", name);
  const { error } = await supabase.from("zones").insert({
    id,
    project_id: projectId,
    level_id: levelId,
    name: name.trim(),
    code: name.trim().slice(0, 6).toUpperCase(),
  });
  return error ? { ok: false, error: error.message } : { ok: true, data: { id } };
}

/* ------------------------------------------------------------------ */
/* Events                                                             */
/* ------------------------------------------------------------------ */

export async function setEventStatus(
  id: string,
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "DISMISSED",
): Promise<Result> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("site_events")
    .update({
      status,
      status_changed_at: now,
      resolved_at: status === "RESOLVED" || status === "DISMISSED" ? now : null,
    })
    .eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true, data: undefined };
}

export async function assignEvent(id: string, assignee: string | null): Promise<Result> {
  const { error } = await supabase.from("site_events").update({ assigned_to: assignee }).eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true, data: undefined };
}

/* ------------------------------------------------------------------ */
/* Blueprints                                                         */
/* ------------------------------------------------------------------ */

export async function setBlueprintApproval(
  id: string,
  approval: "approved" | "rejected" | "pending",
): Promise<Result> {
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("blueprints")
    .update({
      approval_status: approval,
      approved_by: approval === "approved" ? (auth.user?.id ?? null) : null,
      approved_at: approval === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true, data: undefined };
}

/* ------------------------------------------------------------------ */
/* Tasks                                                              */
/* ------------------------------------------------------------------ */

export async function createTask(input: {
  projectId: string;
  levelId?: string | null;
  zoneId?: string | null;
  title: string;
  description?: string;
  priority?: string;
  assignedTo?: string | null;
  dueDate?: string | null;
}): Promise<Result<{ id: string }>> {
  const { data: auth } = await supabase.auth.getUser();
  const id = uniqueId("task", input.title);
  const { error } = await supabase.from("tasks").insert({
    id,
    project_id: input.projectId,
    level_id: input.levelId ?? null,
    zone_id: input.zoneId ?? null,
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    status: "todo",
    priority: input.priority ?? "medium",
    assigned_to: input.assignedTo ?? null,
    due_date: input.dueDate ?? null,
    created_by: auth.user?.id ?? null,
  });
  return error ? { ok: false, error: error.message } : { ok: true, data: { id } };
}

export async function setTaskStatus(id: string, status: string): Promise<Result> {
  const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true, data: undefined };
}

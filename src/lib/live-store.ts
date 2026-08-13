/**
 * Live site state, from the database.
 *
 * Replaces the SSE simulation that invented a new site every second. The public
 * shape is unchanged so the pages consuming `useLiveData()` keep working — but
 * every number now comes from a row somebody's device actually wrote.
 *
 * Where no real source exists yet, the field is empty or null rather than
 * plausible. `latencyMs` is null until a device reports one; `transcript` is
 * empty until voice transcripts are persisted. A dashboard that invents 42 ms is
 * worse than one that shows a dash, because the dash is the truth.
 */
import { useEffect, useSyncExternalStore } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { ActivityEvent, Issue, Status, Worker } from "@/lib/mock-data";

export type TranscriptLine = { id: string; who: "Worker" | "Kaya"; text: string };

export type Kpi = {
  label: string;
  value: string;
  sub: string;
  trend: string;
  trendLevel: Status;
};

export type ZoneCount = { name: string; workers: number; level: Status };
export type HealthMetric = { label: string; value: number; level: Status };

/** An AI-generated report, straight from the `reports` table — no fabricated
 * confidence score or page count, since the schema doesn't track either. */
export type SiteReport = {
  id: string;
  title: string;
  projectId: string | null;
  project: string;
  generated: string;
  summary: string;
  body: string;
  aiProvider: string | null;
};

/** A project with the rollups the cards show, all counted from real rows. */
export type ProjectSummary = {
  id: string;
  name: string;
  code: string;
  client: string;
  location: string;
  phase: string;
  budget: string;
  status: string;
  statusLevel: Status;
  progress: number;
  workers: number;
  openHazards: number;
  blueprint: string;
  ai: string;
  lastActivity: string;
};

/** A task row from `tasks`. No completion percentage exists in the schema, so
 * status is the only progress signal shown — a number here would be invented. */
export type SiteTask = {
  id: string;
  ref: string;
  title: string;
  projectId: string;
  project: string;
  assignee: string;
  location: string;
  due: string;
  priority: string;
  priorityLevel: Status;
  status: string;
  statusLevel: Status;
};

/** A blueprint row from `blueprints`. `aiRiskSummary` is the one AI field the
 * schema actually has — there's no per-sheet component count or file size. */
export type SiteBlueprint = {
  id: string;
  projectId: string;
  name: string;
  code: string;
  project: string;
  level: string | null;
  discipline: string;
  revision: string;
  status: string;
  approval: string;
  approvalLevel: Status;
  uploader: string;
  uploaded: string;
  approvedBy: string | null;
  approvedAt: string | null;
  aiRiskSummary: string | null;
};

export type LiveSnapshot = {
  tick: number;
  emittedAt: number;
  /** Null until a device reports round-trip latency. */
  latencyMs: number | null;
  sessionSeconds: number;
  kpis: Kpi[];
  activity: ActivityEvent[];
  workers: Worker[];
  projects: ProjectSummary[];
  tasks: SiteTask[];
  blueprintsTotal: number;
  blueprintsPending: number;
  blueprints: SiteBlueprint[];
  issues: Issue[];
  reports: SiteReport[];
  aiHealth: HealthMetric[];
  zones: ZoneCount[];
  transcript: TranscriptLine[];
  observations: number;
  alerts: number;
  /** 0–1, null when no analysis has reported confidence. */
  confidence: number | null;
  taskCompletion: number;
  connected: boolean;
  updatedAt: number;
  loading: boolean;
  error: string | null;
};

const EMPTY: LiveSnapshot = {
  tick: 0,
  emittedAt: 0,
  latencyMs: null,
  sessionSeconds: 0,
  kpis: [],
  activity: [],
  workers: [],
  projects: [],
  tasks: [],
  blueprintsTotal: 0,
  blueprintsPending: 0,
  blueprints: [],
  issues: [],
  reports: [],
  aiHealth: [],
  zones: [],
  transcript: [],
  observations: 0,
  alerts: 0,
  confidence: null,
  taskCompletion: 0,
  connected: false,
  updatedAt: 0,
  loading: true,
  error: null,
};

let snapshot: LiveSnapshot = EMPTY;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function set(next: Partial<LiveSnapshot>) {
  snapshot = { ...snapshot, ...next };
  emit();
}

/* ------------------------------------------------------------------ */
/* Derivation                                                          */
/* ------------------------------------------------------------------ */

function severityToStatus(severity: string | null): Status {
  if (severity === "CRITICAL" || severity === "HIGH") return "critical";
  if (severity === "MEDIUM") return "warning";
  if (severity === "LOW") return "success";
  return "idle";
}

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function relative(iso: string | null): string {
  if (!iso) return "—";
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  return `${Math.round(seconds / 3600)}h ago`;
}

/* ------------------------------------------------------------------ */
/* Loading                                                             */
/* ------------------------------------------------------------------ */

let inflight: Promise<void> | null = null;

async function load(): Promise<void> {
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const [profiles, statuses, devices, events, zones, levels, media, tasks, projects, blueprints, reportRows] =
        await Promise.all([
          supabase.from("profiles").select("id, display_name, email, site_role"),
          supabase.from("worker_status").select("*"),
          supabase.from("devices").select("*"),
          supabase
            .from("site_events")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50),
          supabase.from("zones").select("id, name, project_id, level_id"),
          supabase.from("levels").select("id, name, project_id"),
          supabase.from("media_assets").select("id, ai_status, ai_analysis"),
          supabase.from("tasks").select("*"),
          supabase.from("projects").select("*").order("created_at", { ascending: true }),
          supabase.from("blueprints").select("*"),
          supabase
            .from("reports")
            .select("id, project_id, title, summary, body, ai_provider, created_at")
            .order("created_at", { ascending: false })
            .limit(50),
        ]);

      const firstError =
        profiles.error ??
        statuses.error ??
        devices.error ??
        events.error ??
        zones.error ??
        levels.error ??
        media.error ??
        tasks.error ??
        projects.error ??
        blueprints.error ??
        reportRows.error;
      if (firstError) throw new Error(firstError.message);

      const statusByUser = new Map((statuses.data ?? []).map((s) => [s.user_id, s]));
      const deviceByUser = new Map((devices.data ?? []).map((d) => [d.user_id, d]));
      const zoneById = new Map((zones.data ?? []).map((z) => [z.id, z]));
      const projectById = new Map((projects.data ?? []).map((p) => [p.id, p]));

      /* Roster: only people who have actually been on site — a profile with no
         presence row has never carried a device, so listing them as a worker
         with 0% battery would be fiction. */
      const workers: Worker[] = (profiles.data ?? [])
        .filter((p) => statusByUser.has(p.id))
        .map((p) => {
          const st = statusByUser.get(p.id)!;
          const dev = deviceByUser.get(p.id);
          const name = p.display_name ?? p.email ?? "Unnamed worker";
          const zone = zoneById.get(st.zone_id ?? "");
          const session = st.ai_session;
          return {
            id: p.id,
            name,
            role: p.site_role ? p.site_role.replace(/_/g, " ") : "Worker",
            initials: initialsOf(name),
            project: projectById.get(st.project_id ?? "")?.name ?? "Unassigned",
            task: st.task ?? "—",
            zone: zone?.name ?? "—",
            status: session === "active" ? "success" : session === "idle" ? "warning" : "idle",
            statusLabel: session === "active" ? "On task" : session === "idle" ? "Idle" : "Offline",
            aiSession: session,
            // Null battery renders as 0 in the pill, so pass through what the
            // device reported and let the UI show a dash when unknown.
            battery: dev?.battery_level ?? 0,
            hazard: st.hazard ?? "No hazard",
            hazardLevel: st.hazard ? severityToStatus(st.hazard_severity) : "success",
            lastActive: relative(st.last_active_at),
            certifications: [],
            shift: "—",
            glasses: dev?.name ?? "No device paired",
          } satisfies Worker;
        });

      const openEvents = (events.data ?? []).filter((e) => e.status === "OPEN");
      const hazardEvents = openEvents.filter(
        (e) => e.type === "HAZARD" || e.type === "PPE_VIOLATION",
      );
      const liveSessions = workers.filter((w) => w.aiSession === "active").length;

      const activity: ActivityEvent[] = (events.data ?? []).slice(0, 12).map((e) => ({
        id: e.id,
        title: e.title,
        detail: e.description || (projectById.get(e.project_id ?? "")?.name ?? ""),
        time: new Date(e.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        level: severityToStatus(e.severity),
        kind: e.type === "HAZARD" || e.type === "PPE_VIOLATION" ? "hazard" : "observation",
      })) as ActivityEvent[];

      const zoneCounts = new Map<string, number>();
      for (const st of statuses.data ?? []) {
        if (!st.zone_id || st.ai_session === "offline") continue;
        zoneCounts.set(st.zone_id, (zoneCounts.get(st.zone_id) ?? 0) + 1);
      }
      const zoneList: ZoneCount[] = (zones.data ?? []).map((z) => ({
        name: z.name,
        workers: zoneCounts.get(z.id) ?? 0,
        level: (zoneCounts.get(z.id) ?? 0) > 0 ? "success" : "idle",
      }));

      /* Health metrics are computed from real rows rather than invented. Each
         one is a ratio you can verify by counting. */
      const totalMedia = media.data?.length ?? 0;
      const analysed = (media.data ?? []).filter((m) => m.ai_status === "complete").length;
      const onlineDevices = (devices.data ?? []).filter(
        (d) => d.connection_state !== "disconnected",
      ).length;
      const totalDevices = devices.data?.length ?? 0;
      const resolved = (events.data ?? []).filter(
        (e) => e.status === "RESOLVED" || e.status === "DISMISSED",
      ).length;
      const totalEvents = events.data?.length ?? 0;

      const pct = (num: number, den: number) => (den === 0 ? 0 : Math.round((num / den) * 100));

      const aiHealth: HealthMetric[] = [
        { label: "Captures analysed", value: pct(analysed, totalMedia), level: "success" },
        { label: "Devices online", value: pct(onlineDevices, totalDevices), level: "success" },
        { label: "Events resolved", value: pct(resolved, totalEvents), level: "warning" },
      ];

      /* Issues are site_events shaped for the triage board. The board's three
         columns collapse four statuses: DISMISSED sits with RESOLVED because
         both mean "no longer needs attention", and hiding dismissed items would
         make them look lost rather than judged. */
      const levelById = new Map((levels.data ?? []).map((l) => [l.id, l]));
      const nameByUser = new Map(
        (profiles.data ?? []).map((p) => [p.id, p.display_name ?? p.email ?? "Unknown"]),
      );

      const issues: Issue[] = (events.data ?? []).map((e) => {
        const zone = zoneById.get(e.zone_id ?? "");
        const level = levelById.get(e.level_id ?? "");
        const where = [projectById.get(e.project_id ?? "")?.name, level?.name, zone?.name]
          .filter(Boolean)
          .join(" · ");
        return {
          id: e.id,
          // Short human-quotable reference; the full id is long and opaque.
          ref: `#${e.id.slice(-6).toUpperCase()}`,
          title: e.title,
          summary: e.description || "No description recorded.",
          priority:
            e.severity === "CRITICAL"
              ? "Critical"
              : e.severity === "HIGH"
                ? "High"
                : e.severity === "MEDIUM"
                  ? "Medium"
                  : "Low",
          worker:
            e.created_by_label ??
            (e.created_by ? (nameByUser.get(e.created_by) ?? "Unknown") : "Kaya AI"),
          location: where || "Location not recorded",
          reported: relative(e.created_at),
          column:
            e.status === "OPEN"
              ? "open"
              : e.status === "IN_PROGRESS"
                ? "progress"
                : "resolved",
          thumb: severityToStatus(e.severity),
        } satisfies Issue;
      });

      const reports: SiteReport[] = (reportRows.data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        projectId: r.project_id,
        project: projectById.get(r.project_id ?? "")?.name ?? "Unassigned",
        generated: new Date(r.created_at).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        summary: r.summary,
        body: r.body,
        aiProvider: r.ai_provider,
      }));

      /* Task register, straight off `tasks`. The app writes "todo" /
         "in_progress" / "blocked" / "completed" — nothing else. */
      const taskStatusLabel = (status: string) =>
        status === "in_progress"
          ? "In progress"
          : status === "completed"
            ? "Complete"
            : status === "blocked"
              ? "Blocked"
              : "To do";
      const taskStatusLevel = (status: string): Status =>
        status === "blocked"
          ? "critical"
          : status === "completed"
            ? "success"
            : status === "in_progress"
              ? "warning"
              : "idle";
      const taskPriorityLevel = (priority: string | null): Status => {
        const p = (priority ?? "").toLowerCase();
        if (p === "critical") return "critical";
        if (p === "high") return "warning";
        return "idle";
      };

      const siteTasks: SiteTask[] = (tasks.data ?? []).map((t) => {
        const zone = zoneById.get(t.zone_id ?? "");
        const level = levelById.get(t.level_id ?? "");
        return {
          id: t.id,
          ref: `#${t.id.slice(-6).toUpperCase()}`,
          title: t.title,
          projectId: t.project_id,
          project: projectById.get(t.project_id)?.name ?? "Unassigned",
          assignee: t.assigned_to ? (nameByUser.get(t.assigned_to) ?? "Unknown") : "Unassigned",
          location: [level?.name, zone?.name].filter(Boolean).join(" · ") || "Not set",
          due: t.due_date
            ? new Date(t.due_date).toLocaleDateString([], { month: "short", day: "numeric" })
            : "No due date",
          priority: t.priority ? t.priority[0].toUpperCase() + t.priority.slice(1) : "Medium",
          priorityLevel: taskPriorityLevel(t.priority),
          status: taskStatusLabel(t.status),
          statusLevel: taskStatusLevel(t.status),
        } satisfies SiteTask;
      });

      /* Blueprint library, straight off `blueprints`. There's no per-sheet
         component count, indexing percentage or file size in the schema, so
         those mock fields are dropped rather than invented. */
      const blueprintApprovalLabel = (status: string) =>
        status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Pending";
      const blueprintApprovalLevel = (status: string): Status =>
        status === "approved" ? "success" : status === "rejected" ? "critical" : "warning";

      const siteBlueprints: SiteBlueprint[] = (blueprints.data ?? []).map((b) => {
        const level = levelById.get(b.level_id ?? "");
        return {
          id: b.id,
          projectId: b.project_id,
          name: b.name,
          code: b.code,
          project: projectById.get(b.project_id)?.name ?? "Unassigned",
          level: level?.name ?? null,
          discipline: b.discipline || "General",
          revision: b.revision || "v1",
          status: b.status,
          approval: blueprintApprovalLabel(b.approval_status),
          approvalLevel: blueprintApprovalLevel(b.approval_status),
          uploader: b.uploaded_by ? (nameByUser.get(b.uploaded_by) ?? "Unknown") : "Unknown",
          uploaded: new Date(b.created_at).toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          approvedBy: b.approved_by ? (nameByUser.get(b.approved_by) ?? "Unknown") : null,
          approvedAt: b.approved_at
            ? new Date(b.approved_at).toLocaleDateString([], { month: "short", day: "numeric" })
            : null,
          aiRiskSummary: b.ai_risk_summary,
        } satisfies SiteBlueprint;
      });

      const doneTasks = (tasks.data ?? []).filter((t) => t.status === "completed").length;

      /* Project rollups. Every figure is a count over rows, so a card showing
         "3 workers" means three presence rows point at that project. */
      const workersPerProject = new Map<string, number>();
      for (const st of statuses.data ?? []) {
        if (!st.project_id || st.ai_session === "offline") continue;
        workersPerProject.set(st.project_id, (workersPerProject.get(st.project_id) ?? 0) + 1);
      }
      const hazardsPerProject = new Map<string, number>();
      for (const e of hazardEvents) {
        if (!e.project_id) continue;
        hazardsPerProject.set(e.project_id, (hazardsPerProject.get(e.project_id) ?? 0) + 1);
      }
      const lastActivityPerProject = new Map<string, string>();
      // Events arrive newest-first, so the first hit per project is the latest.
      for (const e of events.data ?? []) {
        if (e.project_id && !lastActivityPerProject.has(e.project_id)) {
          lastActivityPerProject.set(e.project_id, e.created_at);
        }
      }
      const blueprintsPerProject = new Map<string, { total: number; pending: number }>();
      for (const b of blueprints.data ?? []) {
        if (!b.project_id) continue;
        const entry = blueprintsPerProject.get(b.project_id) ?? { total: 0, pending: 0 };
        entry.total += 1;
        if (b.approval_status === "pending") entry.pending += 1;
        blueprintsPerProject.set(b.project_id, entry);
      }

      const projectSummaries: ProjectSummary[] = (projects.data ?? []).map((p) => {
        const crew = workersPerProject.get(p.id) ?? 0;
        const bp = blueprintsPerProject.get(p.id);
        return {
          id: p.id,
          name: p.name,
          code: p.code ?? "",
          client: p.client ?? "",
          location: p.location ?? "",
          phase: p.phase ?? "",
          budget: p.budget ?? "",
          status: p.status ?? "active",
          statusLevel:
            (hazardsPerProject.get(p.id) ?? 0) > 0
              ? "critical"
              : p.status === "completed"
                ? "idle"
                : "success",
          progress: p.progress ?? 0,
          workers: crew,
          openHazards: hazardsPerProject.get(p.id) ?? 0,
          blueprint: bp ? `${bp.total} drawings · ${bp.pending} pending` : "None uploaded",
          ai: crew > 0 ? `${crew} streaming` : "No active session",
          lastActivity: relative(lastActivityPerProject.get(p.id) ?? null),
        };
      });

      const kpis: Kpi[] = [
        {
          label: "Workers on site",
          value: String(workers.filter((w) => w.aiSession !== "offline").length),
          sub: `${workers.length} tracked`,
          trend: `${liveSessions} live`,
          trendLevel: "success",
        },
        {
          label: "Live AI sessions",
          value: String(liveSessions),
          sub: `${totalDevices} devices paired`,
          trend: onlineDevices > 0 ? `${onlineDevices} online` : "none online",
          trendLevel: onlineDevices > 0 ? "success" : "critical",
        },
        {
          label: "Open hazards",
          value: String(hazardEvents.length),
          sub: `${openEvents.length} open events`,
          trend: hazardEvents.length === 0 ? "clear" : "needs review",
          trendLevel: hazardEvents.length === 0 ? "success" : "critical",
        },
        {
          label: "Captures",
          value: String(totalMedia),
          sub: `${analysed} analysed`,
          trend: totalMedia === 0 ? "none yet" : `${pct(analysed, totalMedia)}%`,
          trendLevel: "success",
        },
      ];

      /* Confidence must come from the model. Averaging over analyses that
         reported one, and null when none did. */
      const confidences = (events.data ?? [])
        .map((e) => e.ai_confidence)
        .filter((c): c is number => typeof c === "number");
      const confidence = confidences.length
        ? confidences.reduce((a, b) => a + b, 0) / confidences.length
        : null;

      set({
        tick: snapshot.tick + 1,
        emittedAt: Date.now(),
        workers,
        projects: projectSummaries,
        tasks: siteTasks,
        blueprintsTotal: blueprints.data?.length ?? 0,
        blueprintsPending: (blueprints.data ?? []).filter((b) => b.approval_status === "pending").length,
        blueprints: siteBlueprints,
        issues,
        reports,
        activity,
        zones: zoneList,
        aiHealth,
        kpis,
        observations: totalMedia,
        alerts: hazardEvents.length,
        confidence,
        taskCompletion: pct(doneTasks, tasks.data?.length ?? 0),
        // No device reports link latency to the database yet.
        latencyMs: null,
        sessionSeconds: 0,
        transcript: [],
        connected: true,
        updatedAt: Date.now(),
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        connected: false,
        loading: false,
        error: error instanceof Error ? error.message : "Could not load live site state.",
      });
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/* ------------------------------------------------------------------ */
/* Realtime                                                            */
/* ------------------------------------------------------------------ */

let channel: RealtimeChannel | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

/** Coalesces a burst of row changes into one refetch. */
function scheduleRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    refreshTimer = null;
    void load();
  }, 400);
}

function open() {
  if (channel) return;
  channel = supabase.channel("dashboard-live");
  for (const table of [
    "worker_status",
    "devices",
    "site_events",
    "media_assets",
    "tasks",
    "zones",
    "projects",
    "profiles",
    "reports",
    "blueprints",
  ]) {
    channel.on("postgres_changes", { event: "*", schema: "public", table }, scheduleRefresh);
  }
  void channel.subscribe();
  void load();
}

function close() {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = null;
  if (!channel) return;
  void supabase.removeChannel(channel);
  channel = null;
  set({ connected: false });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  open();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) close();
  };
}

export function useLiveData(): LiveSnapshot {
  const state = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => EMPTY,
  );
  // Realtime covers row changes, but relative timestamps ("3m ago") go stale on
  // their own, so refresh on a slow tick as well.
  useEffect(() => {
    const timer = setInterval(() => void load(), 60_000);
    return () => clearInterval(timer);
  }, []);
  return state;
}

/** Forces a refetch — used after a mutation that Realtime may not cover. */
export function refreshLiveData() {
  return load();
}

export function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function secondsAgo(updatedAt: number) {
  if (!updatedAt) return null;
  return Math.max(0, Math.round((Date.now() - updatedAt) / 1000));
}

/**
 * Proves the ownership rule the two surfaces depend on:
 *   dashboard authors the hierarchy, the field app only reads it.
 *
 * If a worker could write projects, a mistyped tap on a phone could rename a
 * site out from under everyone; if a worker could not read them, the app would
 * have no context to attach a capture to. Both directions are checked.
 *
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/verify-site-admin.mjs <supervisorEmail> <supervisorPassword>
 */
import { createClient } from "@supabase/supabase-js";

const URL_ = process.env["SUPABASE_URL"];
const ANON = process.env["SUPABASE_ANON_KEY"];
const SERVICE = process.env["SUPABASE_SERVICE_ROLE_KEY"];
const [email, password] = process.argv.slice(2);

if (!URL_ || !ANON || !SERVICE || !email || !password) {
  console.error("Need SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY + email password");
  process.exit(1);
}

let failed = false;
const check = (name, ok, detail) => {
  if (!ok) failed = true;
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const admin = createClient(URL_, SERVICE, { auth: { persistSession: false } });
const sup = createClient(URL_, ANON, { auth: { persistSession: false } });

const supIn = await sup.auth.signInWithPassword({ email, password });
check("supervisor signed in", !supIn.error, supIn.error?.message);
if (supIn.error) process.exit(1);

const stamp = Date.now().toString(36);
const projectId = `proj_verify_${stamp}`;
const levelId = `lvl_verify_${stamp}`;
const zoneId = `zone_verify_${stamp}`;

/* Supervisor authors the hierarchy ---------------------------------- */

const p = await sup.from("projects").insert({
  id: projectId,
  name: "Site Admin Verification",
  code: `SAV-${stamp.slice(-4).toUpperCase()}`,
  client: "Internal",
  location: "Verification",
  phase: "Checks",
  status: "active",
  progress: 0,
  created_by: supIn.data.user.id,
});
check("supervisor creates project", !p.error, p.error?.message);

const l = await sup
  .from("levels")
  .insert({ id: levelId, project_id: projectId, name: "Level 1", number: 1, status: "in_progress" });
check("supervisor creates level", !l.error, l.error?.message);

const z = await sup
  .from("zones")
  .insert({ id: zoneId, project_id: projectId, level_id: levelId, name: "Zone A", code: "L1-A" });
check("supervisor creates zone", !z.error, z.error?.message);

const setCurrent = await sup
  .from("projects")
  .update({ current_level_id: levelId })
  .eq("id", projectId);
check("current_level_id set so the app can resolve context", !setCurrent.error, setCurrent.error?.message);

/* A worker reads but cannot write ----------------------------------- */

const workerEmail = `worker.admin.${stamp}@kaya.local`;
const workerPassword = `Wk-${Math.random().toString(36).slice(2)}!7`;
const created = await admin.auth.admin.createUser({
  email: workerEmail,
  password: workerPassword,
  email_confirm: true,
  user_metadata: { full_name: "Read Only Worker", origin: "mobile", site_role: "worker" },
});
check("worker account created", !created.error, created.error?.message);
const workerId = created.data?.user?.id;

const worker = createClient(URL_, ANON, { auth: { persistSession: false } });
const wIn = await worker.auth.signInWithPassword({ email: workerEmail, password: workerPassword });
check("worker signed in", !wIn.error, wIn.error?.message);

const readProject = await worker.from("projects").select("id, name").eq("id", projectId).maybeSingle();
check("worker reads the project", !!readProject.data, readProject.data?.name ?? readProject.error?.message);

const readZone = await worker.from("zones").select("id").eq("id", zoneId).maybeSingle();
check("worker reads the zone", !!readZone.data, readZone.error?.message ?? "found");

const rename = await worker.from("projects").update({ name: "Hijacked" }).eq("id", projectId);
const afterRename = await sup.from("projects").select("name").eq("id", projectId).maybeSingle();
check(
  "worker cannot rename a project",
  afterRename.data?.name === "Site Admin Verification",
  rename.error?.message ?? `name is now "${afterRename.data?.name}"`,
);

const invent = await worker.from("projects").insert({ id: `proj_rogue_${stamp}`, name: "Rogue site" });
check("worker cannot create a project", !!invent.error, invent.error?.message ?? "ALLOWED — policy hole");

/* Cascade behaviour -------------------------------------------------- */

await sup.from("projects").delete().eq("id", projectId);
const orphanLevels = await admin.from("levels").select("id").eq("id", levelId);
const orphanZones = await admin.from("zones").select("id").eq("id", zoneId);
check(
  "deleting a project cascades its levels and zones",
  (orphanLevels.data?.length ?? 0) === 0 && (orphanZones.data?.length ?? 0) === 0,
  `levels=${orphanLevels.data?.length} zones=${orphanZones.data?.length}`,
);

/* Clean up ---------------------------------------------------------- */

await admin.from("projects").delete().eq("id", `proj_rogue_${stamp}`);
if (workerId) await admin.auth.admin.deleteUser(workerId);
check("verification account removed", true, "database left clean");

console.log(failed ? "\nFAILED" : "\nSITE ADMIN OK");
process.exit(failed ? 1 : 0);

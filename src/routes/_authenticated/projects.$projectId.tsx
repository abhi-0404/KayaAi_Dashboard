import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import {
  Avatar,
  BatteryPill,
  ProgressBar,
  SectionHeader,
  StatusChip,
} from "@/components/primitives";
import { aiHealth, blueprints, projects, reports, tasks, workers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  loader: ({ params }) => {
    const project = projects.find((p) => p.id === params.projectId);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Project unavailable — Kaya AI" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.project.name} — Kaya AI`;
    const description = `${loaderData.project.name}: ${loaderData.project.progress}% complete, ${loaderData.project.workers} workers, ${loaderData.project.blueprint}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProjectDetail,
});

const TABS = ["Overview", "Workers", "Tasks", "Blueprints", "Reports", "Analytics"] as const;

function ProjectDetail() {
  const { project } = Route.useLoaderData();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  const crew = workers.filter((w) => w.project === project.name);
  const projectTasks = tasks.filter((t) => t.project === project.name);
  const projectBlueprints = blueprints.filter((b) => b.project === project.name);
  const projectReports = reports.filter(
    (r) => r.project === project.name || r.project === "All projects",
  );

  return (
    <div className="space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All projects
      </Link>

      <div className="panel p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold tracking-tight">{project.name}</h2>
            <p className="num mt-1 truncate text-sm text-muted-foreground">
              {project.code} · {project.client} · {project.location}
            </p>
          </div>
          <StatusChip level={project.statusLevel}>{project.status}</StatusChip>
        </div>

        <dl className="mt-6 grid gap-x-6 gap-y-4 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Phase", value: project.phase },
            { label: "Contract value", value: project.budget },
            { label: "Crew on site", value: `${project.workers} workers` },
            { label: "Last activity", value: project.lastActivity },
          ].map((row) => (
            <div key={row.label} className="min-w-0">
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {row.label}
              </dt>
              <dd className="mt-1 truncate text-sm font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "relative shrink-0 px-3.5 pb-3 pt-2 text-sm transition-colors",
              tab === t
                ? "font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
            {tab === t && (
              <span className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in duration-200">
        {tab === "Overview" && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="panel p-6">
              <SectionHeader title="Construction progress" description={project.phase} />
              <div className="mt-6 space-y-5">
                {[
                  { label: "Overall completion", value: project.progress },
                  { label: "Structure", value: Math.min(100, project.progress + 12) },
                  { label: "Envelope", value: Math.max(0, project.progress - 18) },
                  { label: "MEP rough-in", value: Math.max(0, project.progress - 29) },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground/80">{row.label}</span>
                      <span className="num font-medium">{row.value}%</span>
                    </div>
                    <ProgressBar className="mt-2" value={row.value} level={project.statusLevel} />
                  </div>
                ))}
              </div>
            </div>
            <div className="panel p-6">
              <SectionHeader title="AI coverage" description={project.ai} />
              <div className="mt-6 space-y-4">
                {aiHealth.map((h) => (
                  <div key={h.label}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground/80">{h.label}</span>
                      <span className="num font-medium">{h.value}%</span>
                    </div>
                    <ProgressBar className="mt-1.5" value={h.value} level={h.level} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "Workers" && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {crew.map((w) => (
              <div key={w.id} className="panel p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar initials={w.initials} level={w.status} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{w.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{w.role}</p>
                  </div>
                </div>
                <p className="mt-3 truncate text-xs text-foreground/80">{w.task}</p>
                <div className="mt-3 flex items-center justify-between">
                  <StatusChip level={w.status}>{w.statusLabel}</StatusChip>
                  <BatteryPill value={w.battery} />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Tasks" && (
          <div className="panel divide-y divide-border">
            {projectTasks.map((t) => (
              <div key={t.id} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_200px_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="num mt-0.5 truncate text-xs text-muted-foreground">
                    {t.ref} · {t.assignee} · due {t.due}
                  </p>
                </div>
                <ProgressBar value={t.progress} level={t.status === "Blocked" ? "critical" : "success"} />
                <StatusChip
                  level={
                    t.status === "Blocked"
                      ? "critical"
                      : t.status === "Complete"
                        ? "success"
                        : t.status === "Scheduled"
                          ? "idle"
                          : "warning"
                  }
                >
                  {t.status}
                </StatusChip>
              </div>
            ))}
          </div>
        )}

        {tab === "Blueprints" && (
          <div className="grid gap-4 md:grid-cols-2">
            {projectBlueprints.map((b) => (
              <div key={b.id} className="panel p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <p className="truncate text-sm font-semibold">{b.name}</p>
                  <StatusChip level={b.approvalLevel}>{b.approval}</StatusChip>
                </div>
                <p className="num mt-2 text-xs text-muted-foreground">
                  {b.version} · {b.sheets} sheets · {b.uploaded}
                </p>
                <p className="mt-3 text-xs text-foreground/75">{b.processing}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "Reports" && (
          <div className="grid gap-4 md:grid-cols-2">
            {projectReports.map((r) => (
              <div key={r.id} className="panel p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <p className="truncate text-sm font-semibold">{r.type}</p>
                  <StatusChip level="success">{r.confidence}% confidence</StatusChip>
                </div>
                <p className="num mt-2 text-xs text-muted-foreground">{r.generated}</p>
                <p className="mt-3 text-xs leading-relaxed text-foreground/75">{r.summary}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "Analytics" && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Safety score", value: "97.3", sub: "PPE compliance, 7-day" },
              { label: "AI observations", value: "1,842", sub: "captured this week" },
              { label: "Avg. session length", value: "38m", sub: "per worker per shift" },
              { label: "Deviations flagged", value: "12", sub: "vs approved blueprints" },
            ].map((m) => (
              <div key={m.label} className="panel p-5">
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <p className="num mt-3 text-3xl font-semibold">{m.value}</p>
                <p className="mt-2 text-xs text-muted-foreground">{m.sub}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

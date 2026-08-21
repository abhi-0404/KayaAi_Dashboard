import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";

import { ProgressBar, StatusChip,
  PageHeader,
} from "@/components/primitives";
import { useLiveData } from "@/lib/live-store";
import { NewProjectDialog } from "@/components/new-project-dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/projects/")({
  head: () => ({
    meta: [
      { title: "Projects - Kaya AI" },
      {
        name: "description",
        content:
          "All active construction projects with progress, crew size, blueprint state and AI monitoring status.",
      },
      { property: "og:title", content: "Projects - Kaya AI" },
      {
        property: "og:description",
        content: "Track progress, crews, blueprints and AI coverage across every jobsite.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const [menu, setMenu] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const { projects, workers, loading, error } = useLiveData();
  const liveSessions = workers.filter((w) => w.aiSession === "active").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Projects" description="Every active jobsite and its progress" />
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <p className="min-w-0 text-sm text-muted-foreground">
          {error
            ? error
            : loading
              ? "Loading projects…"
              : `${projects.length} project${projects.length === 1 ? "" : "s"} · ${workers.length} crew tracked · ${liveSessions} AI session${liveSessions === 1 ? "" : "s"} live`}
        </p>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-strong"
        >
          <Plus className="h-4 w-4" /> New project
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {projects.map((p) => (
          <article
            key={p.id}
            className="panel p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
              <div className="min-w-0">
                <Link
                  to="/projects/$projectId"
                  params={{ projectId: p.id }}
                  className="truncate text-base font-semibold hover:text-primary"
                >
                  {p.name}
                </Link>
                <p className="num mt-1 truncate text-xs text-muted-foreground">
                  {p.code} · {p.client}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusChip level={p.statusLevel}>{p.status}</StatusChip>
                <div className="relative">
                  <button
                    aria-label="Quick actions"
                    onClick={() => setMenu(menu === p.id ? null : p.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  <div
                    className={cn(
                      "absolute right-0 top-10 z-10 w-48 origin-top-right rounded-xl border border-border bg-popover p-1.5 shadow-raised transition-all duration-150",
                      menu === p.id
                        ? "pointer-events-auto scale-100 opacity-100"
                        : "pointer-events-none scale-95 opacity-0",
                    )}
                  >
                    {["Open project", "Assign workers", "Upload blueprint", "Generate report"].map(
                      (a) => (
                        <button
                          key={a}
                          className="w-full rounded-md px-2.5 py-1.5 text-left text-sm text-foreground/85 transition-colors hover:bg-accent"
                        >
                          {a}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Construction progress</span>
                <span className="num font-medium text-foreground">{p.progress}%</span>
              </div>
              <ProgressBar className="mt-2" value={p.progress} level={p.statusLevel} />
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-5 sm:grid-cols-4">
              {[
                { label: "Workers", value: String(p.workers) },
                { label: "Blueprint", value: p.blueprint },
                { label: "AI status", value: p.ai },
                { label: "Last activity", value: p.lastActivity },
              ].map((row) => (
                <div key={row.label} className="min-w-0">
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd className="mt-1 truncate text-xs font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      {!loading && projects.length === 0 && (
        <div className="panel p-10 text-center">
          <p className="text-[15px] font-semibold">No projects yet</p>
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
            Create a site here and it appears on the phones immediately. The field app needs at
            least one project with a level and a zone before a worker can capture anything.
          </p>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-strong"
          >
            <Plus className="h-4 w-4" /> Create your first project
          </button>
        </div>
      )}

      <NewProjectDialog open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}

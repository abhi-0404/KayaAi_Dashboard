import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { StatusChip, PageHeader } from "@/components/primitives";
import { useLiveData } from "@/lib/live-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks - Kaya AI" },
      {
        name: "description",
        content: "Field task register with assignees, due dates and status, straight from the database.",
      },
      { property: "og:title", content: "Tasks - Kaya AI" },
      {
        property: "og:description",
        content: "Every field task with assignee, priority, due date and status.",
      },
    ],
  }),
  component: TasksPage,
});

const FILTERS = ["All", "To do", "In progress", "Blocked", "Complete"] as const;

function TasksPage() {
  const { tasks, loading, error } = useLiveData();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const rows = tasks.filter((t) => filter === "All" || t.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description={
          error
            ? error
            : loading
              ? "Loading…"
              : `${tasks.length} task${tasks.length === 1 ? "" : "s"} assigned across crews`
        }
      />
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "h-8 rounded-lg px-3 text-xs font-medium transition-colors",
              filter === f
                ? "bg-foreground text-background"
                : "border border-border bg-card text-muted-foreground hover:bg-accent",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {!loading && rows.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">No tasks match this filter.</p>
      )}

      <div className="panel divide-y divide-border">
        {rows.map((t) => (
          <div
            key={t.id}
            className="grid gap-4 p-5 transition-colors hover:bg-accent/40 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto] lg:items-center"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="num text-[11px] font-medium text-muted-foreground">{t.ref}</span>
                <StatusChip dot={false} level={t.priorityLevel}>
                  {t.priority}
                </StatusChip>
              </div>
              <p className="mt-1.5 truncate text-sm font-medium">{t.title}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {t.project} · {t.assignee} · due {t.due}
              </p>
            </div>
            <div className="min-w-0">
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Location</dt>
              <dd className="mt-1 truncate text-xs font-medium">{t.location}</dd>
            </div>
            <StatusChip level={t.statusLevel}>{t.status}</StatusChip>
          </div>
        ))}
      </div>
    </div>
  );
}

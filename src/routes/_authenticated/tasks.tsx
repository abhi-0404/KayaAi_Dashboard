import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ProgressBar, StatusChip,
  PageHeader,
} from "@/components/primitives";
import { tasks } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Kaya AI" },
      {
        name: "description",
        content:
          "Field task register with assignees, due windows, priority and completion tracked against AI observations.",
      },
      { property: "og:title", content: "Tasks — Kaya AI" },
      {
        property: "og:description",
        content: "Every field task with assignee, priority, due window and live progress.",
      },
    ],
  }),
  component: TasksPage,
});

const FILTERS = ["All", "Blocked", "In progress", "Scheduled", "Complete"] as const;

function TasksPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const rows = tasks.filter((t) => filter === "All" || t.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Work assigned across crews" />
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

      <div className="panel divide-y divide-border">
        {rows.map((t) => (
          <div
            key={t.id}
            className="grid gap-4 p-5 transition-colors hover:bg-accent/40 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto] lg:items-center"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="num text-[11px] font-medium text-muted-foreground">{t.ref}</span>
                <StatusChip
                  dot={false}
                  level={
                    t.priority === "Critical"
                      ? "critical"
                      : t.priority === "High"
                        ? "warning"
                        : "idle"
                  }
                >
                  {t.priority}
                </StatusChip>
              </div>
              <p className="mt-1.5 truncate text-sm font-medium">{t.title}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {t.project} · {t.assignee} · due {t.due}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="num font-medium text-foreground">{t.progress}%</span>
              </div>
              <ProgressBar
                className="mt-2"
                value={t.progress}
                level={t.status === "Blocked" ? "critical" : t.status === "Complete" ? "success" : "warning"}
              />
            </div>
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
    </div>
  );
}

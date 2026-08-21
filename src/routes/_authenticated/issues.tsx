import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, MapPin, X } from "lucide-react";

import { StatusChip,
  PageHeader,
} from "@/components/primitives";
import type { Issue, Status } from "@/lib/mock-data";
import { useLiveData } from "@/lib/live-store";
import { setEventStatus } from "@/lib/site-admin";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/issues")({
  head: () => ({
    meta: [
      { title: "Issue Management - Kaya AI" },
      {
        name: "description",
        content:
          "Kanban issue board for site hazards and defects with AI summaries, reporter, location and priority.",
      },
      { property: "og:title", content: "Issue Management - Kaya AI" },
      {
        property: "og:description",
        content: "Triage site issues from open to resolved with AI-written summaries.",
      },
    ],
  }),
  component: IssuesPage,
});

const columns = [
  { key: "open", label: "Open" },
  { key: "progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
] as const;

const priorityLevel = (p: Issue["priority"]): Status =>
  p === "Critical" ? "critical" : p === "High" ? "warning" : p === "Medium" ? "idle" : "success";

const thumbTone: Record<string, string> = {
  critical: "bg-critical/10 text-critical",
  warning: "bg-warning/12 text-warning",
  info: "bg-primary/8 text-primary",
  success: "bg-success/10 text-success",
};

function IssuesPage() {
  const { issues, loading, error } = useLiveData();
  const [open, setOpen] = useState<Issue | null>(null);
  const [busy, setBusy] = useState(false);

  // Triage actions write straight through; Realtime brings the board back.
  const move = async (id: string, status: "IN_PROGRESS" | "RESOLVED") => {
    setBusy(true);
    await setEventStatus(id, status);
    setBusy(false);
    setOpen(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issue Management"
        description={
          error
            ? error
            : loading
              ? "Loading issues…"
              : `${issues.length} event${issues.length === 1 ? "" : "s"} raised from the field`
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((col) => {
          const items = issues.filter((i) => i.column === col.key);
          return (
            <div key={col.key} className="rounded-xl border border-border bg-muted/40 p-3">
              <div className="flex items-center justify-between px-1.5 pb-3">
                <p className="text-sm font-semibold">{col.label}</p>
                <span className="num rounded-md bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border">
                  {items.length}
                </span>
              </div>
              <div className="space-y-3">
                {items.map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => setOpen(issue)}
                    className="panel w-full p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised"
                  >
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          "grid h-14 w-14 shrink-0 place-items-center rounded-lg",
                          thumbTone[issue.thumb] ?? thumbTone["info"],
                        )}
                      >
                        <Camera className="h-5 w-5" strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="num text-[11px] font-medium text-muted-foreground">
                            {issue.ref}
                          </span>
                          <StatusChip dot={false} level={priorityLevel(issue.priority)}>
                            {issue.priority}
                          </StatusChip>
                        </div>
                        <p className="mt-1 truncate text-sm font-medium">{issue.title}</p>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {issue.summary}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
                      <span className="truncate">{issue.worker}</span>
                      <span className="num shrink-0">{issue.reported}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div
        onClick={() => setOpen(null)}
        className={cn(
          "fixed inset-0 z-50 grid place-items-center bg-foreground/25 p-6 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {open && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-raised"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="num text-xs font-medium text-muted-foreground">{open.ref}</span>
                  <StatusChip level={priorityLevel(open.priority)}>{open.priority}</StatusChip>
                </div>
                <h2 className="mt-2 truncate text-lg font-semibold">{open.title}</h2>
              </div>
              <button
                aria-label="Close"
                onClick={() => setOpen(null)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              className={cn(
                "mt-5 grid h-40 place-items-center rounded-xl",
                thumbTone[open.thumb] ?? thumbTone["info"],
              )}
            >
              <Camera className="h-8 w-8" strokeWidth={1.5} />
            </div>

            <div className="mt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                AI summary
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">{open.summary}</p>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-3">
              {[
                { label: "Reported by", value: open.worker },
                { label: "Location", value: open.location },
                { label: "Reported", value: open.reported },
              ].map((row) => (
                <div key={row.label} className="min-w-0">
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd className="mt-1 flex items-center gap-1.5 truncate text-sm font-medium">
                    {row.label === "Location" && (
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-wrap gap-2">
              {open.column === "open" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void move(open.id, "IN_PROGRESS")}
                  className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-60"
                >
                  Start work
                </button>
              )}
              {open.column !== "resolved" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void move(open.id, "RESOLVED")}
                  className="h-11 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-60"
                >
                  Mark resolved
                </button>
              )}
              {open.column === "resolved" && (
                <p className="text-[13px] text-muted-foreground">
                  Closed. Reopen from the database if this needs another look.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

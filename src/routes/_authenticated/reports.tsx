import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

import { PageHeader } from "@/components/primitives";
import { useLiveData } from "@/lib/live-store";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "AI Reports — Kaya AI" },
      {
        name: "description",
        content: "Reports generated from field observations, straight from the database.",
      },
      { property: "og:title", content: "AI Reports — Kaya AI" },
      {
        property: "og:description",
        content: "Reports generated from field observations, straight from the database.",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { reports, loading, error } = useLiveData();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Reports"
        description={
          loading
            ? "Loading…"
            : error
              ? "Could not load reports."
              : `${reports.length} report${reports.length === 1 ? "" : "s"} generated from field observations`
        }
      />

      {!loading && reports.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">
          No reports yet — reports appear here once a session generates one.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((r) => {
          const expanded = expandedId === r.id;
          return (
            <article key={r.id} className="panel p-6 transition-shadow duration-200 hover:shadow-raised">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/8 ring-1 ring-primary/15">
                    <FileText className="h-4.5 w-4.5 text-primary" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.project}</p>
                  </div>
                </div>
                {r.aiProvider && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {r.aiProvider}
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-foreground/80">{r.summary}</p>

              {expanded && r.body && r.body !== r.summary && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/70">{r.body}</p>
              )}

              <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border pt-5">
                <p className="num truncate text-xs text-muted-foreground">{r.generated}</p>
                {r.body && r.body !== r.summary && (
                  <button
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-accent"
                    onClick={() => setExpandedId(expanded ? null : r.id)}
                  >
                    {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    {expanded ? "Collapse" : "Read full report"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

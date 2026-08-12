import { createFileRoute } from "@tanstack/react-router";
import { Download, Eye, FileText } from "lucide-react";

import { ProgressBar, StatusChip,
  PageHeader,
} from "@/components/primitives";
import { reports } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "AI Reports — Kaya AI" },
      {
        name: "description",
        content:
          "AI-generated daily, weekly, inspection and compliance reports with confidence scoring and PDF export.",
      },
      { property: "og:title", content: "AI Reports — Kaya AI" },
      {
        property: "og:description",
        content: "Daily, weekly, inspection and compliance reports generated from site observations.",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="AI Reports" description="Generated from field observations" />
      <p className="text-sm text-muted-foreground">
        Generated from 1,842 AI observations across 4 projects · retention 24 months
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((r) => (
          <article key={r.id} className="panel p-6 transition-shadow duration-200 hover:shadow-raised">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/8 ring-1 ring-primary/15">
                  <FileText className="h-4.5 w-4.5 text-primary" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{r.type}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.project}</p>
                </div>
              </div>
              <StatusChip level={r.confidence >= 92 ? "success" : "warning"}>
                {r.confidence}% confidence
              </StatusChip>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-foreground/80">{r.summary}</p>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>AI confidence</span>
                <span className="num font-medium text-foreground">{r.confidence}%</span>
              </div>
              <ProgressBar
                className="mt-2"
                value={r.confidence}
                level={r.confidence >= 92 ? "success" : "warning"}
              />
            </div>

            <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border pt-5">
              <p className="num truncate text-xs text-muted-foreground">
                {r.generated} · {r.pages} pages
              </p>
              <div className="flex gap-2">
                <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-accent">
                  <Eye className="h-3.5 w-3.5" /> Preview
                </button>
                <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  <Download className="h-3.5 w-3.5" /> PDF
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

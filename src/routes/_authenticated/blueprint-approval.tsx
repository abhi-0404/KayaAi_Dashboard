import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, History, Sparkles, X, ZoomIn, ZoomOut } from "lucide-react";

import { ProgressBar, StatusChip,
  PageHeader,
} from "@/components/primitives";
import { blueprints } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/blueprint-approval")({
  head: () => ({
    meta: [
      { title: "Blueprint Approval — Kaya AI" },
      {
        name: "description",
        content:
          "Admin review queue: inspect drawing sets alongside AI component detection, risk summary and approval history.",
      },
      { property: "og:title", content: "Blueprint Approval — Kaya AI" },
      {
        property: "og:description",
        content: "Approve, reject or request changes on drawing sets with AI-assisted risk analysis.",
      },
    ],
  }),
  component: ApprovalPage,
});

const detected = [
  { name: "Structural columns", count: 84, level: "success" as const },
  { name: "Beams & girders", count: 132, level: "success" as const },
  { name: "Shear walls", count: 18, level: "success" as const },
  { name: "Embed plates", count: 46, level: "warning" as const },
  { name: "Unlabeled penetrations", count: 7, level: "critical" as const },
];

const historyLog = [
  { who: "Lena Fischer", action: "Uploaded v8", when: "Aug 8, 2026 · 14:02" },
  { who: "Kaya AI", action: "Indexed 31 sheets, 286 components", when: "Aug 8, 2026 · 14:09" },
  { who: "Dana Whitfield", action: "Requested changes on v7", when: "Aug 5, 2026 · 09:31" },
  { who: "Tom Whitaker", action: "Uploaded v7", when: "Aug 4, 2026 · 17:48" },
];

function ApprovalPage() {
  const pending = blueprints.filter((b) => b.approval !== "Approved");
  const [activeId, setActiveId] = useState(pending[0]?.id ?? "");
  const [zoom, setZoom] = useState(1);
  const [decision, setDecision] = useState<string | null>(null);

  const bp = pending.find((b) => b.id === activeId) ?? pending[0];
  if (!bp) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Blueprint Approval" description="Review and sign off pending drawings" />
      <div className="flex flex-wrap gap-2">
        {pending.map((b) => (
          <button
            key={b.id}
            onClick={() => {
              setActiveId(b.id);
              setDecision(null);
            }}
            className={cn(
              "h-9 rounded-lg px-3.5 text-sm font-medium transition-colors",
              b.id === bp.id
                ? "bg-foreground text-background"
                : "border border-border bg-card text-muted-foreground hover:bg-accent",
            )}
          >
            {b.project} · {b.version}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Left: preview */}
        <div className="panel overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{bp.name}</p>
              <p className="num truncate text-xs text-muted-foreground">
                {bp.version} · {bp.sheets} sheets · uploaded {bp.uploaded}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="num text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
              <button
                aria-label="Zoom out"
                onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-accent"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                aria-label="Zoom in"
                onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-accent"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="h-[420px] overflow-hidden bg-background">
            <div
              className="h-full w-full transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            >
              <svg viewBox="0 0 400 280" className="h-full w-full" role="presentation">
                <defs>
                  <pattern id="apgrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M20 0H0V20" fill="none" stroke="oklch(0.9 0.02 250)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="400" height="280" fill="url(#apgrid)" />
                <rect x="30" y="30" width="200" height="140" fill="none" stroke="oklch(0.5 0.1 255)" strokeWidth="1.5" />
                <rect x="245" y="30" width="125" height="80" fill="none" stroke="oklch(0.5 0.1 255)" strokeWidth="1.5" />
                <rect x="245" y="125" width="125" height="45" fill="none" stroke="oklch(0.5 0.1 255)" strokeWidth="1.5" />
                <rect x="30" y="190" width="340" height="55" fill="none" stroke="oklch(0.5 0.1 255)" strokeWidth="1.5" />
                <rect x="150" y="80" width="40" height="40" fill="none" stroke="oklch(0.58 0.24 27)" strokeWidth="1.5" strokeDasharray="4 2" />
                <rect x="290" y="140" width="34" height="20" fill="none" stroke="oklch(0.75 0.16 70)" strokeWidth="1.5" strokeDasharray="4 2" />
                <line x1="30" y1="100" x2="230" y2="100" stroke="oklch(0.75 0.04 255)" strokeWidth="0.8" strokeDasharray="4 3" />
              </svg>
            </div>
          </div>

          <div className="border-t border-border p-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Version history
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["v8 · current", "v7", "v6", "v5"].map((v, i) => (
                <span
                  key={v}
                  className={cn(
                    "num rounded-md px-2.5 py-1 text-xs font-medium",
                    i === 0
                      ? "bg-primary/8 text-primary ring-1 ring-primary/20"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: AI analysis */}
        <div className="space-y-6">
          <div className="panel p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">AI analysis</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              286 components extracted with 0.93 mean confidence. Sheet numbering is continuous and
              matches the transmittal. Two areas need human review before release to field glasses.
            </p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Indexing confidence</span>
                <span className="num font-medium text-foreground">93%</span>
              </div>
              <ProgressBar className="mt-2" value={93} />
            </div>
          </div>

          <div className="panel p-5">
            <p className="text-sm font-semibold">Detected components</p>
            <div className="mt-3 divide-y divide-border">
              {detected.map((d) => (
                <div key={d.name} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="truncate text-sm text-foreground/85">{d.name}</span>
                  <StatusChip level={d.level}>{d.count}</StatusChip>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <p className="text-sm font-semibold">Risk summary</p>
            <ul className="mt-3 space-y-3">
              {[
                {
                  level: "critical" as const,
                  text: "7 unlabeled floor penetrations in Bay 4 — fall-hazard exposure if released as-is.",
                },
                {
                  level: "warning" as const,
                  text: "Embed plate schedule references a detail sheet not present in this set.",
                },
                {
                  level: "success" as const,
                  text: "Egress routes and guardrail lines are fully dimensioned.",
                },
              ].map((r, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      r.level === "critical"
                        ? "bg-critical"
                        : r.level === "warning"
                          ? "bg-warning"
                          : "bg-success",
                    )}
                  />
                  <p className="text-sm leading-relaxed text-foreground/80">{r.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel p-5">
            <p className="text-sm font-semibold">Approval history</p>
            <ol className="mt-3 space-y-3">
              {historyLog.map((h, i) => (
                <li key={i} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{h.action}</p>
                    <p className="truncate text-xs text-muted-foreground">{h.who}</p>
                  </div>
                  <span className="num text-[11px] text-muted-foreground">{h.when}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="panel p-5">
            <p className="text-xs text-muted-foreground">
              Uploaded by <span className="font-medium text-foreground">{bp.uploader}</span> ·{" "}
              {bp.size}
            </p>
            {decision && (
              <div className="mt-4">
                <StatusChip
                  level={
                    decision === "Approved"
                      ? "success"
                      : decision === "Rejected"
                        ? "critical"
                        : "warning"
                  }
                >
                  {decision}
                </StatusChip>
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setDecision("Approved")}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-success px-3.5 text-sm font-medium text-success-foreground transition-colors hover:bg-success/90"
              >
                <Check className="h-4 w-4" /> Approve
              </button>
              <button
                onClick={() => setDecision("Rejected")}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-critical px-3.5 text-sm font-medium text-critical-foreground transition-colors hover:bg-critical/90"
              >
                <X className="h-4 w-4" /> Reject
              </button>
              <button
                onClick={() => setDecision("Changes requested")}
                className="h-9 rounded-lg border border-border px-3.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                Request changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

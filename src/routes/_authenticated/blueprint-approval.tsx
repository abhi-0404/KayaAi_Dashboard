import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, History, Sparkles, X, ZoomIn, ZoomOut } from "lucide-react";

import { StatusChip, PageHeader } from "@/components/primitives";
import { useLiveData } from "@/lib/live-store";
import { setBlueprintApproval } from "@/lib/site-admin";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/blueprint-approval")({
  head: () => ({
    meta: [
      { title: "Blueprint Approval - Kaya AI" },
      {
        name: "description",
        content: "Admin review queue: approve or reject pending drawing sets with the AI risk summary.",
      },
      { property: "og:title", content: "Blueprint Approval - Kaya AI" },
      {
        property: "og:description",
        content: "Approve or reject drawing sets awaiting sign-off.",
      },
    ],
  }),
  component: ApprovalPage,
});

function ApprovalPage() {
  const { blueprints, loading, error } = useLiveData();
  const pending = blueprints.filter((b) => b.approval === "Pending");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);

  const bp = pending.find((b) => b.id === activeId) ?? pending[0] ?? null;

  // Writes straight through; Realtime brings the queue back once the row updates.
  const decide = async (id: string, approval: "approved" | "rejected") => {
    setBusy(true);
    await setBlueprintApproval(id, approval);
    setBusy(false);
    setActiveId(null);
  };

  if (!loading && pending.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Blueprint Approval" description="Review and sign off pending drawings" />
        <p className="text-sm text-muted-foreground">
          {error ?? "Nothing is waiting on approval right now."}
        </p>
      </div>
    );
  }

  if (!bp) return null;

  const historyLog = [
    { who: bp.uploader, action: `Uploaded ${bp.revision}`, when: bp.uploaded },
    ...(bp.approvedBy
      ? [{ who: bp.approvedBy, action: bp.approval, when: bp.approvedAt ?? bp.uploaded }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Blueprint Approval" description="Review and sign off pending drawings" />
      <div className="flex flex-wrap gap-2">
        {pending.map((b) => (
          <button
            key={b.id}
            onClick={() => setActiveId(b.id)}
            className={cn(
              "h-9 rounded-lg px-3.5 text-sm font-medium transition-colors",
              b.id === bp.id
                ? "bg-foreground text-background"
                : "border border-border bg-card text-muted-foreground hover:bg-accent",
            )}
          >
            {b.project} · {b.revision}
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
                {bp.revision} · {bp.discipline} · uploaded {bp.uploaded}
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
                <line x1="30" y1="100" x2="230" y2="100" stroke="oklch(0.75 0.04 255)" strokeWidth="0.8" strokeDasharray="4 3" />
              </svg>
            </div>
          </div>

          <div className="border-t border-border p-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                History
              </p>
            </div>
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
        </div>

        {/* Right: AI analysis + decision */}
        <div className="space-y-6">
          <div className="panel p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">AI risk summary</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              {bp.aiRiskSummary ?? "No AI analysis available for this drawing set yet."}
            </p>
          </div>

          <div className="panel p-5">
            <p className="text-sm font-semibold">Details</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                { label: "Code", value: bp.code || "-" },
                { label: "Discipline", value: bp.discipline },
                { label: "Level", value: bp.level ?? "Not set" },
                { label: "Status", value: bp.status },
              ].map((row) => (
                <div key={row.label} className="min-w-0">
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd className="mt-0.5 truncate text-sm font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="panel p-5">
            <p className="text-xs text-muted-foreground">
              Uploaded by <span className="font-medium text-foreground">{bp.uploader}</span>
            </p>
            <div className="mt-4">
              <StatusChip level={bp.approvalLevel}>{bp.approval}</StatusChip>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void decide(bp.id, "approved")}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-success px-3.5 text-sm font-medium text-success-foreground transition-colors hover:bg-success/90 disabled:opacity-60"
              >
                <Check className="h-4 w-4" /> Approve
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void decide(bp.id, "rejected")}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-critical px-3.5 text-sm font-medium text-critical-foreground transition-colors hover:bg-critical/90 disabled:opacity-60"
              >
                <X className="h-4 w-4" /> Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

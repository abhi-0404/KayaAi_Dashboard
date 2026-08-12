import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileStack, UploadCloud, X, ZoomIn, ZoomOut } from "lucide-react";

import { StatusChip,
  PageHeader,
} from "@/components/primitives";
import { blueprints, type Blueprint } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/blueprints")({
  head: () => ({
    meta: [
      { title: "Blueprint Library — Kaya AI" },
      {
        name: "description",
        content:
          "Versioned blueprint library with AI indexing status, approval state and sheet-level previews for every project.",
      },
      { property: "og:title", content: "Blueprint Library — Kaya AI" },
      {
        property: "og:description",
        content: "Upload, index and approve construction drawing sets with AI-assisted review.",
      },
    ],
  }),
  component: BlueprintsPage,
});

function BlueprintSheet() {
  return (
    <div className="relative h-full w-full bg-[oklch(0.99_0.004_247)]">
      <svg viewBox="0 0 400 260" className="h-full w-full" role="presentation">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="oklch(0.9 0.02 250)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="400" height="260" fill="url(#grid)" />
        <rect x="40" y="40" width="180" height="120" fill="none" stroke="oklch(0.5 0.1 255)" strokeWidth="1.5" />
        <rect x="230" y="40" width="130" height="70" fill="none" stroke="oklch(0.5 0.1 255)" strokeWidth="1.5" />
        <rect x="230" y="120" width="130" height="40" fill="none" stroke="oklch(0.5 0.1 255)" strokeWidth="1.5" />
        <rect x="40" y="180" width="320" height="40" fill="none" stroke="oklch(0.5 0.1 255)" strokeWidth="1.5" />
        <line x1="40" y1="100" x2="220" y2="100" stroke="oklch(0.7 0.05 255)" strokeWidth="0.8" strokeDasharray="4 3" />
        <circle cx="130" cy="100" r="16" fill="none" stroke="oklch(0.55 0.2 262)" strokeWidth="1.2" />
        <line x1="40" y1="28" x2="360" y2="28" stroke="oklch(0.7 0.05 255)" strokeWidth="0.6" />
      </svg>
    </div>
  );
}

function BlueprintsPage() {
  const [preview, setPreview] = useState<Blueprint | null>(null);
  const [zoom, setZoom] = useState(1);

  return (
    <div className="space-y-6">
      <PageHeader title="Blueprint Library" description="Drawings, revisions and AI verification status" />
      <div className="panel border-dashed p-10 text-center transition-colors hover:border-primary/50 hover:bg-primary/[0.02]">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/8 ring-1 ring-primary/20">
          <UploadCloud className="h-5 w-5 text-primary" />
        </div>
        <p className="mt-4 text-sm font-semibold">Upload a drawing set</p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
          Drop PDF, DWG or RVT files here. Kaya indexes every sheet, extracts components and
          makes the set searchable for on-site glasses comparison.
        </p>
        <button className="mt-5 h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          Select files
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {blueprints.map((b) => (
          <button
            key={b.id}
            onClick={() => setPreview(b)}
            className="panel overflow-hidden text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised"
          >
            <div className="h-36 border-b border-border">
              <BlueprintSheet />
            </div>
            <div className="p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <p className="truncate text-sm font-semibold">{b.name}</p>
                <StatusChip level={b.approvalLevel}>{b.approval}</StatusChip>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">{b.project}</p>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4">
                {[
                  { label: "Version", value: b.version },
                  { label: "Uploaded", value: b.uploaded },
                  { label: "AI indexed", value: b.indexed ? "Yes" : "In progress" },
                  { label: "Sheets", value: `${b.sheets}` },
                ].map((row) => (
                  <div key={row.label} className="min-w-0">
                    <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {row.label}
                    </dt>
                    <dd className="num mt-0.5 truncate text-xs font-medium">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 truncate text-xs text-muted-foreground">{b.processing}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Preview modal */}
      <div
        className={cn(
          "fixed inset-0 z-50 grid place-items-center bg-foreground/25 p-6 transition-opacity duration-200",
          preview ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setPreview(null)}
      >
        {preview && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-raised"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border p-4">
              <div className="flex min-w-0 items-center gap-3">
                <FileStack className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{preview.name}</p>
                  <p className="num truncate text-xs text-muted-foreground">
                    {preview.version} · {preview.sheets} sheets · {preview.size} · {preview.uploader}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Zoom out"
                  onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
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
                <button
                  aria-label="Close"
                  onClick={() => setPreview(null)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="h-[420px] overflow-hidden bg-background">
              <div
                className="h-full w-full origin-center transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
              >
                <BlueprintSheet />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

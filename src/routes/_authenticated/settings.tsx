import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { PageHeader, StatusChip } from "@/components/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings - Kaya AI" },
      {
        name: "description",
        content:
          "Configure organization details, AI detection thresholds, smart glasses fleet policies and alert routing.",
      },
      { property: "og:title", content: "Settings - Kaya AI" },
      {
        property: "og:description",
        content: "Organization, AI detection and smart glasses fleet configuration.",
      },
    ],
  }),
  component: SettingsPage,
});

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
        on ? "bg-primary" : "bg-border",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-card shadow-card transition-transform duration-200",
          on ? "translate-x-[1.125rem]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function SettingsPage() {
  const [flags, setFlags] = useState<Record<string, boolean>>({
    ppe: true,
    fall: true,
    voice: true,
    archive: false,
    escalate: true,
  });
  const toggle = (k: string) => setFlags((f) => ({ ...f, [k]: !f[k] }));

  return (
    <div className="grid max-w-4xl gap-6">
      <PageHeader title="Settings" description="Workspace, alerting and integration preferences" />
      <section className="panel p-6">
        <h2 className="text-sm font-semibold">Organization</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Applies to every project and connected smart glasses device.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            { label: "Company name", value: "Meridian Construction Group" },
            { label: "Primary region", value: "US West" },
            { label: "Safety standard", value: "OSHA 1926" },
            { label: "Data retention", value: "24 months" },
          ].map((f) => (
            <label key={f.label} className="block">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {f.label}
              </span>
              <input
                defaultValue={f.value}
                className="mt-1.5 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/60"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="panel p-6">
        <h2 className="text-sm font-semibold">AI detection</h2>
        <div className="mt-4 divide-y divide-border">
          {[
            { key: "ppe", label: "PPE compliance detection", desc: "Helmet, vest and harness checks every 30 seconds." },
            { key: "fall", label: "Fall-hazard detection", desc: "Edge proximity and unguarded opening alerts." },
            { key: "voice", label: "Voice conversation logging", desc: "Store transcripts alongside session video." },
            { key: "escalate", label: "Auto-escalate critical hazards", desc: "Notify supervisor within 15 seconds." },
            { key: "archive", label: "Archive raw video", desc: "Keep full-resolution capture beyond 7 days." },
          ].map((row) => (
            <div key={row.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{row.label}</p>
                <p className="truncate text-xs text-muted-foreground">{row.desc}</p>
              </div>
              <Toggle on={Boolean(flags[row.key])} onClick={() => toggle(row.key)} />
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Smart glasses fleet</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              31 devices enrolled · firmware 4.8.2 · edge sync every 5 seconds
            </p>
          </div>
          <StatusChip level="success">Healthy</StatusChip>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Save changes
          </button>
          <button className="h-9 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-accent">
            Push firmware update
          </button>
        </div>
      </section>
    </div>
  );
}

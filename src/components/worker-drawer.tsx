import { X, Radio, MapPin, Clock, ShieldCheck, Glasses } from "lucide-react";

import { Avatar, BatteryPill, ProgressBar, StatusChip } from "@/components/primitives";
import type { Worker } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function WorkerDrawer({
  worker,
  onClose,
}: {
  worker: Worker | null;
  onClose: () => void;
}) {
  const open = Boolean(worker);
  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-foreground/20 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-[420px] overflow-y-auto border-l border-border bg-card transition-transform duration-250 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {worker && (
          <div className="p-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar initials={worker.initials} size="lg" level={worker.status} />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{worker.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{worker.role}</p>
                  <p className="num mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                    {worker.id}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <StatusChip level={worker.status}>{worker.statusLabel}</StatusChip>
              <StatusChip level={worker.hazardLevel}>{worker.hazard}</StatusChip>
            </div>

            <dl className="mt-6 space-y-4">
              {[
                { icon: Clock, label: "Current task", value: worker.task },
                { icon: MapPin, label: "Zone", value: worker.zone },
                { icon: Radio, label: "Project", value: worker.project },
                { icon: Glasses, label: "Device", value: worker.glasses },
                { icon: ShieldCheck, label: "Shift", value: worker.shift },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-3">
                  <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {row.label}
                    </dt>
                    <dd className="text-sm font-medium">{row.value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-6 rounded-xl border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Device battery</p>
                <BatteryPill value={worker.battery} />
              </div>
              <ProgressBar
                className="mt-3"
                value={worker.battery}
                level={worker.battery < 20 ? "critical" : worker.battery < 45 ? "warning" : "success"}
              />
              <p className="num mt-2 text-[11px] text-muted-foreground">
                Last telemetry {worker.lastActive}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-xs font-medium text-muted-foreground">AI session summary</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                {worker.aiSession === "active"
                  ? `Vision model is tracking ${worker.task.toLowerCase()}. No unsafe posture events in the last 20 minutes. Voice channel idle.`
                  : "No active session. Last capture archived and indexed against the approved blueprint set."}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-xs font-medium text-muted-foreground">Certifications</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {worker.certifications.map((c) => (
                  <span
                    key={c}
                    className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-2">
              <button className="h-9 flex-1 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Open live feed
              </button>
              <button className="h-9 flex-1 rounded-lg border border-border text-sm font-medium transition-colors hover:bg-accent">
                Message worker
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

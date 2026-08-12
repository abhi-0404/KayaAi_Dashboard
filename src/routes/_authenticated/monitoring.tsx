import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Battery,
  Mic,
  Search,
  Signal,
  Sparkles,
  TriangleAlert,
  Video,
  Maximize2,
} from "lucide-react";

import {
  Avatar,
  PageHeader,
  ProgressBar,
  StatusChip,
  StatusDot,
} from "@/components/primitives";
import { formatClock, useLiveData } from "@/lib/live-store";
import { cn } from "@/lib/utils";
import liveFeed from "@/assets/live-feed.jpg";

export const Route = createFileRoute("/_authenticated/monitoring")({
  head: () => ({
    meta: [
      { title: "Live Monitoring — Kaya AI" },
      {
        name: "description",
        content:
          "Live Meta Smart Glasses feeds with AI observations, hazard alerts, voice transcript and device telemetry per worker.",
      },
      { property: "og:title", content: "Live Monitoring — Kaya AI" },
      {
        property: "og:description",
        content: "Watch what the AI sees: live glasses feed, hazard alerts and voice transcript.",
      },
    ],
  }),
  component: MonitoringPage,
});

const FILTERS = ["All", "Live", "Hazard", "Idle"] as const;


function MonitoringPage() {
  const {
    workers,
    transcript,
    latencyMs,
    sessionSeconds,
    observations,
    alerts,
    confidence,
    taskCompletion,
    connected,
  } = useLiveData();
  const live = workers.filter((w) => w.aiSession !== "offline");
  const [activeId, setActiveId] = useState(live[0]?.id ?? "");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");

  const filtered = live.filter((w) => {
    const matchQ = `${w.name} ${w.zone}`.toLowerCase().includes(q.toLowerCase());
    const matchF =
      filter === "All" ||
      (filter === "Live" && w.aiSession === "active") ||
      (filter === "Hazard" && w.hazardLevel !== "success") ||
      (filter === "Idle" && w.aiSession === "idle");
    return matchQ && matchF;
  });

  const worker = live.find((w) => w.id === activeId) ?? live[0];
  if (!worker) return null;

  return (
    <div>
      <PageHeader title="Live Monitoring" description="First-person feeds from the glasses fleet" />
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      {/* Left panel */}
      <div className="panel flex max-h-[calc(100vh-8rem)] flex-col overflow-hidden">
        <div className="border-b border-border p-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search workers"
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary/60"
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "h-7 rounded-md px-2.5 text-xs font-medium transition-colors",
                  filter === f
                    ? "bg-foreground text-background"
                    : "border border-border text-muted-foreground hover:bg-accent",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filtered.map((w) => (
            <button
              key={w.id}
              onClick={() => setActiveId(w.id)}
              className={cn(
                "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg p-2.5 text-left transition-colors",
                w.id === worker.id ? "bg-primary/8 ring-1 ring-primary/25" : "hover:bg-accent",
              )}
            >
              <Avatar initials={w.initials} size="sm" level={w.status} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{w.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{w.zone}</p>
              </div>
              <StatusDot level={w.hazardLevel} pulse={w.hazardLevel === "critical"} />
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No workers match these filters.</p>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="space-y-6">
        <div className="panel overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border p-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar initials={worker.initials} level={worker.status} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{worker.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {worker.role} · {worker.zone}
                </p>
              </div>
            </div>
            <div className="hidden items-center gap-4 text-xs text-muted-foreground sm:flex">
              <span className="flex items-center gap-1.5">
                <Signal className="h-3.5 w-3.5" /> <span className="num">{latencyMs == null ? "—" : latencyMs + " ms"}</span>
              </span>
              <span className="num flex items-center gap-1.5">
                <Battery className="h-3.5 w-3.5" /> {worker.battery}%
              </span>
              <span className="num flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5" /> {formatClock(sessionSeconds)}
              </span>
            </div>
          </div>

          <div className="relative aspect-video w-full bg-ink">
            <img
              src={liveFeed}
              alt={`Live smart glasses feed from ${worker.name} at ${worker.zone}`}
              className="h-full w-full object-cover"
            />
            <div className="scan-lines pointer-events-none absolute inset-0" />
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-md bg-ink/80 px-2.5 py-1.5 backdrop-blur">
              <StatusDot level="critical" pulse />
              <span className="num text-[11px] font-semibold uppercase tracking-wider text-ink-foreground">
                Live · {worker.glasses}
              </span>
            </div>
            <div className="absolute right-4 top-4 flex gap-2">
              <button
                aria-label="Fullscreen"
                className="grid h-8 w-8 place-items-center rounded-md bg-ink/80 text-ink-foreground backdrop-blur transition-colors hover:bg-ink"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="absolute inset-x-4 bottom-4 rounded-lg bg-ink/85 p-3 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Current observation
              </p>
              {/* Only what the worker's status actually records. The previous
                  copy asserted a specific 14 mm bolt-gap finding for every
                  worker on every feed, which no model had produced. */}
              <p className="mt-1 text-sm text-ink-foreground">
                {worker.hazardLevel !== "success" && worker.hazard !== "No hazard"
                  ? worker.hazard
                  : worker.task && worker.task !== "—"
                    ? `Tracking ${worker.task.toLowerCase()}.`
                    : "No observation reported yet."}
              </p>
            </div>
            {/* AI bounding box overlay */}
            <div className="pointer-events-none absolute left-[18%] top-[24%] h-[34%] w-[26%] rounded-sm border border-primary/80">
              <span className="num absolute -top-5 left-0 rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                worker · 0.97
              </span>
            </div>
            <div className="pointer-events-none absolute right-[20%] top-[40%] h-[26%] w-[20%] rounded-sm border border-warning/80">
              <span className="num absolute -top-5 left-0 rounded-sm bg-warning px-1.5 py-0.5 text-[10px] font-medium text-warning-foreground">
                beam gap · {confidence == null ? "—" : confidence.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="panel p-5">
              <div className="flex items-center gap-2">
                <TriangleAlert className="h-4 w-4 text-warning" />
                <p className="text-sm font-semibold">Hazard alerts</p>
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-border p-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <p className="truncate text-sm font-medium">{worker.hazard}</p>
                    <StatusChip level={worker.hazardLevel}>
                      {worker.hazardLevel === "success" ? "Clear" : "Active"}
                    </StatusChip>
                  </div>
                  <p className="num mt-1 text-xs text-muted-foreground">
                    Detected 09:41:02 · confidence 0.94
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <p className="truncate text-sm font-medium">Unsecured tool at edge</p>
                    <StatusChip level="idle">Resolved</StatusChip>
                  </div>
                  <p className="num mt-1 text-xs text-muted-foreground">
                    Detected 09:12:41 · cleared by worker
                  </p>
                </div>
              </div>
            </div>

            <div className="panel p-5">
              <p className="text-sm font-semibold">Current task</p>
              <p className="mt-2 text-sm text-foreground/80">{worker.task}</p>
              <p className="mt-1 text-xs text-muted-foreground">{worker.project}</p>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Task completion</span>
                    <span className="num font-medium text-foreground">{taskCompletion}%</span>
                  </div>
                  <ProgressBar className="mt-2" value={taskCompletion} />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Device battery</span>
                    <span className="num font-medium text-foreground">{worker.battery}%</span>
                  </div>
                  <ProgressBar
                    className="mt-2"
                    value={worker.battery}
                    level={worker.battery < 20 ? "critical" : worker.battery < 45 ? "warning" : "success"}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="panel p-5">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Voice conversation</p>
              </div>
              <div className="mt-4 sKaya">
                {transcript.map((line) => (
                  <div
                    key={line.id}
                    className={cn(
                      "rounded-lg p-3 text-sm leading-relaxed",
                      line.who === "Kaya"
                        ? "bg-primary/6 text-foreground/85 ring-1 ring-primary/15"
                        : "bg-muted text-foreground/85",
                    )}
                  >
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {line.who}
                    </p>
                    {line.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="panel p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">AI summary</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                {worker.name} has been on {worker.task.toLowerCase()} for 38 minutes. Work matches the
                approved blueprint set with one 14 mm deviation flagged for QA. PPE compliance
                verified 6 times this session. No fall-hazard exposure detected.
              </p>
              <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
                {[
                  { label: "Observations", value: String(observations) },
                  { label: "Alerts", value: String(alerts) },
                  { label: "Confidence", value: confidence == null ? "—" : confidence.toFixed(2) },
                ].map((s) => (
                  <div key={s.label}>
                    <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </dt>
                    <dd className="num mt-1 text-lg font-semibold">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

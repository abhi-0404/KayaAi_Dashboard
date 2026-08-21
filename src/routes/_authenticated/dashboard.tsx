import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Download,
  FileStack,
  FolderOpen,
  HardHat,
  Plus,
  Radio,
  TriangleAlert,
} from "lucide-react";

import {
  AlertBanner,
  Avatar,
  BatteryPill,
  CountChip,
  DataTable,
  FolderCard,
  GhostButton,
  PageHeader,
  Panel,
  PrimaryButton,
  RadialGauge,
  RowMenu,
  SectionHeader,
  SegmentBar,
  StatFigure,
  StatusChip,
  StatusDot,
  TableToolbar,
  type Column,
} from "@/components/primitives";
import { WorkerDrawer } from "@/components/worker-drawer";
import { useLiveData } from "@/lib/live-store";
import type { Worker } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard - Kaya AI Construction Command Center" },
      {
        name: "description",
        content:
          "Real-time construction command center: worker safety, AI glasses sessions, hazards, blueprints and project progress in one operational view.",
      },
      { property: "og:title", content: "Kaya AI - Construction Command Center" },
      {
        property: "og:description",
        content:
          "Monitor workers, hazards, AI sessions and project progress in real time across every jobsite.",
      },
    ],
  }),
  component: Dashboard,
});

const FILTERS = ["All", "Live", "Hazard"] as const;

function Dashboard() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const { activity, workers, projects, blueprintsTotal, blueprintsPending, aiHealth, zones, connected, tick } =
    useLiveData();

  const selected = workers.find((w) => w.id === selectedId) ?? null;

  const live = workers.filter((w) => w.aiSession === "active").length;
  const idle = workers.filter((w) => w.aiSession === "idle").length;
  const offline = workers.filter((w) => w.aiSession === "offline").length;
  const hazards = workers.filter((w) => w.hazardLevel !== "success").length;
  const coverage = workers.length ? (live / workers.length) * 100 : 0;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return workers.filter((w) => {
      const matchQ =
        !q || `${w.name} ${w.role} ${w.zone} ${w.project} ${w.task}`.toLowerCase().includes(q);
      const matchF =
        filter === "All" ||
        (filter === "Live" && w.aiSession === "active") ||
        (filter === "Hazard" && w.hazardLevel !== "success");
      return matchQ && matchF;
    });
  }, [workers, query, filter]);

  const columns: Column<Worker>[] = [
    {
      key: "worker",
      header: "Worker",
      sortable: true,
      compare: (a, b) => a.name.localeCompare(b.name),
      cell: (w) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar initials={w.initials} size="sm" level={w.status} />
          <div className="min-w-0">
            <p className="truncate font-medium">{w.name}</p>
            <p className="truncate text-[11.5px] text-muted-foreground">{w.role}</p>
          </div>
        </div>
      ),
    },
    {
      key: "id",
      header: "Worker ID",
      sortable: true,
      compare: (a, b) => a.id.localeCompare(b.id),
      cell: (w) => <span className="num text-muted-foreground">#{w.id.replace("w-", "")}</span>,
    },
    {
      key: "task",
      header: "Current task",
      cell: (w) => <span className="block max-w-[15rem] truncate">{w.task}</span>,
    },
    {
      key: "zone",
      header: "Zone",
      sortable: true,
      compare: (a, b) => a.zone.localeCompare(b.zone),
      cell: (w) => <span className="truncate text-muted-foreground">{w.zone}</span>,
    },
    {
      key: "session",
      header: "Session",
      cell: (w) => (
        <StatusChip level={w.aiSession === "active" ? "success" : w.aiSession === "idle" ? "warning" : "idle"}>
          {w.aiSession === "active" ? "Live" : w.aiSession === "idle" ? "Idle" : "Offline"}
        </StatusChip>
      ),
    },
    {
      key: "battery",
      header: "Battery",
      sortable: true,
      compare: (a, b) => a.battery - b.battery,
      cell: (w) => <BatteryPill value={w.battery} />,
    },
    {
      key: "hazard",
      header: "Status",
      cell: (w) => <StatusChip level={w.hazardLevel}>{w.hazard}</StatusChip>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        action={
          <PrimaryButton icon={Plus} to="/reports">
            New Report
          </PrimaryButton>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
        {/* Left column */}
        <div className="min-w-0 space-y-4">
          {/* Folder-style summary cards */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FolderCard
              title="Active crews"
              meta={`${workers.length} workers · ${projects.length} sites`}
              to="/workers"
              icon={HardHat}
            />
            <FolderCard
              title="Live sessions"
              meta={`${live} streaming · ${idle} idle`}
              to="/monitoring"
              icon={Radio}
              tint={live > 0 ? "success" : "idle"}
            />
            <FolderCard
              title="Open hazards"
              meta={`${hazards} flagged · ${offline} offline`}
              to="/issues"
              icon={TriangleAlert}
              tint={hazards > 0 ? "critical" : "success"}
            />
            <FolderCard
              title="Blueprints"
              meta={`${blueprintsTotal} drawings · ${blueprintsPending} pending`}
              to="/blueprints"
              icon={FileStack}
            />
          </section>

          {/* Crew table */}
          <Panel className="p-5">
            <div className="flex items-start justify-between">
              <SectionHeader
                title="Crew activity"
                description={
                  connected
                    ? `Live across every project · update #${tick}`
                    : "Connecting to the live stream"
                }
              />
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-4">
              <TableToolbar
                actions={
                  <>
                    {FILTERS.map((f) => (
                      <GhostButton key={f} active={filter === f} onClick={() => setFilter(f)}>
                        {f}
                      </GhostButton>
                    ))}
                  </>
                }
                query={query}
                onQuery={setQuery}
                placeholder="Search crew"
                sort={<GhostButton icon={Download}>Export</GhostButton>}
              />
            </div>

            <div className="mt-2">
              <DataTable
                rows={rows}
                columns={columns}
                rowKey={(w) => w.id}
                onRowClick={(w) => setSelectedId(w.id)}
                empty="No crew match these filters."
                bulkActions={(sel, clear) => (
                  <>
                    <GhostButton
                      onClick={() => {
                        setSelectedId(sel[0]?.id ?? null);
                        clear();
                      }}
                    >
                      Open first
                    </GhostButton>
                    <GhostButton icon={Download}>Export {sel.length}</GhostButton>
                  </>
                )}
                rowMenu={(w) => (
                  <RowMenu>
                    <button
                      type="button"
                      onClick={() => setSelectedId(w.id)}
                      className="block w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors hover:bg-accent"
                    >
                      View worker
                    </button>
                    <button
                      type="button"
                      className="block w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors hover:bg-accent"
                    >
                      Open live feed
                    </button>
                  </RowMenu>
                )}
              />
            </div>
          </Panel>
        </div>

        {/* Right rail */}
        <div className="min-w-0 space-y-4">
          <Panel className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-[15px] font-semibold tracking-tight">Fleet compliance</p>
              <RowMenu />
            </div>

            <div className="mt-5">
              <SegmentBar
                segments={[
                  { value: Math.max(offline, 1), level: "critical", label: "Offline" },
                  { value: Math.max(idle, 1), level: "warning", label: "Idle" },
                  { value: Math.max(live, 1), level: "success", label: "Live" },
                ]}
              />
            </div>

            <div className="mt-5 flex gap-2">
              <CountChip value={offline} label="Offline" level="critical" />
              <CountChip value={idle} label="Idle" level="warning" />
              <CountChip value={hazards} label="Hazards" level="warning" />
            </div>

            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
              <StatFigure value={live} label="Live sessions" />
              <StatFigure value={workers.length} label="Tracked" />
            </div>

            <div className="mt-4">
              <AlertBanner>
                Offline glasses stop reporting hazards. Check charge and connectivity before the
                next shift handover.
              </AlertBanner>
            </div>
          </Panel>

          {/* The one saturated surface */}
          <div className="brand-panel p-5">
            <div className="flex items-start justify-between">
              <p className="text-[15px] font-semibold tracking-tight">AI Coverage</p>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/15">
                <FolderOpen className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-3 flex items-center gap-4">
              <RadialGauge
                percent={coverage}
                primaryLabel={`${live} of ${workers.length}`}
                secondaryLabel="streaming now"
              />
              <div className="min-w-0 flex-1 space-y-2">
                {aiHealth.slice(0, 3).map((h) => (
                  <div
                    key={h.label}
                    className="rounded-xl border border-white/20 bg-white/10 px-3 py-2"
                  >
                    <p className="num text-[13px] font-semibold">{h.value}%</p>
                    <p className="truncate text-[11px] opacity-80">{h.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Panel className="p-5">
            <SectionHeader title="Worker distribution" description="By zone" />
            <div className="mt-4 space-y-2">
              {zones.map((z) => (
                <div key={z.name} className="well flex items-center justify-between px-3 py-2.5">
                  <span className="flex min-w-0 items-center gap-2 text-[13px]">
                    <span className="truncate">{z.name}</span>
                  </span>
                  <StatusChip level={z.level} dot={false}>
                    {z.workers}
                  </StatusChip>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <SectionHeader title="Recent activity" description="Today · site time" />
            <ol className="mt-4 space-y-3">
              {activity.slice(0, 5).map((e) => (
                <li key={e.id} className="flex gap-2.5">
                  <span className="mt-2">
                    <StatusDot level={e.level} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-[13px] font-medium">{e.title}</p>
                      <span className="num shrink-0 text-[11px] text-muted-foreground">
                        {e.time}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                      {e.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>

      <WorkerDrawer worker={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}

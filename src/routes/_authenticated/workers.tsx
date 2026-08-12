import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, HardHat, Radio, TriangleAlert, Users } from "lucide-react";

import {
  Avatar,
  BatteryPill,
  DataTable,
  FolderCard,
  GhostButton,
  PageHeader,
  Panel,
  RowMenu,
  SectionHeader,
  StatusChip,
  TableToolbar,
  type Column,
} from "@/components/primitives";
import { WorkerDrawer } from "@/components/worker-drawer";
import { useLiveData } from "@/lib/live-store";
import type { Worker } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/workers")({
  head: () => ({
    meta: [
      { title: "Workers — Kaya AI" },
      {
        name: "description",
        content:
          "Every connected worker: role, project, current task, AI session state, glasses battery and hazard status.",
      },
      { property: "og:title", content: "Workers — Kaya AI" },
      {
        property: "og:description",
        content: "Crew roster with live AI session state, telemetry and hazard status.",
      },
    ],
  }),
  component: WorkersPage,
});

const FILTERS = ["All", "Live", "Idle", "Hazard"] as const;

function WorkersPage() {
  // Live roster: profiles that have actually carried a device, joined to their
  // current presence and telemetry.
  const { workers, loading, error } = useLiveData();
  const [selected, setSelected] = useState<Worker | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const live = workers.filter((w) => w.aiSession === "active").length;
  const idle = workers.filter((w) => w.aiSession === "idle").length;
  const hazards = workers.filter((w) => w.hazardLevel !== "success").length;

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return workers.filter((w) => {
      const matchQ =
        !query ||
        `${w.name} ${w.role} ${w.project} ${w.task} ${w.zone}`.toLowerCase().includes(query);
      const matchF =
        filter === "All" ||
        (filter === "Live" && w.aiSession === "active") ||
        (filter === "Idle" && w.aiSession === "idle") ||
        (filter === "Hazard" && w.hazardLevel !== "success");
      return matchQ && matchF;
    });
  }, [workers, q, filter]);

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
            <p className="num truncate text-[11.5px] text-muted-foreground">{w.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      compare: (a, b) => a.role.localeCompare(b.role),
      cell: (w) => <span className="truncate">{w.role}</span>,
    },
    {
      key: "project",
      header: "Project",
      sortable: true,
      compare: (a, b) => a.project.localeCompare(b.project),
      cell: (w) => <span className="truncate text-muted-foreground">{w.project}</span>,
    },
    {
      key: "task",
      header: "Current task",
      cell: (w) => <span className="block max-w-[14rem] truncate">{w.task}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (w) => <StatusChip level={w.status}>{w.statusLabel}</StatusChip>,
    },
    {
      key: "session",
      header: "Session",
      sortable: true,
      compare: (a, b) => a.aiSession.localeCompare(b.aiSession),
      cell: (w) => (
        <StatusChip
          level={w.aiSession === "active" ? "success" : w.aiSession === "idle" ? "warning" : "idle"}
        >
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
      key: "last",
      header: "Last active",
      cell: (w) => <span className="num text-muted-foreground">{w.lastActive}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Workers"
        description="Crew status, sessions and hazards"
        action={<GhostButton icon={Download}>Export roster</GhostButton>}
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FolderCard title="Total crew" meta={`${workers.length} workers enrolled`} icon={Users} />
        <FolderCard
          title="Live sessions"
          meta={`${live} streaming now`}
          icon={Radio}
          tint={live > 0 ? "success" : "idle"}
        />
        <FolderCard title="Idle devices" meta={`${idle} paired, not streaming`} icon={HardHat} tint="warning" />
        <FolderCard
          title="Hazard flags"
          meta={`${hazards} needing review`}
          to="/issues"
          icon={TriangleAlert}
          tint={hazards > 0 ? "critical" : "success"}
        />
      </section>

      <Panel className="mt-4 p-5">
        <SectionHeader
          title="Crew roster"
          description={
            error
              ? error
              : loading
                ? "Loading roster…"
                : `${rows.length} of ${workers.length} workers shown`
          }
        />

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
            query={q}
            onQuery={setQ}
            placeholder="Filter roster"
          />
        </div>

        <div className="mt-2">
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(w) => w.id}
            onRowClick={setSelected}
            empty={
              workers.length === 0
                ? "No crew have paired a device yet. Sign in on the app and pair the glasses."
                : "No workers match these filters."
            }
            bulkActions={(sel) => <GhostButton icon={Download}>Export {sel.length}</GhostButton>}
            rowMenu={(w) => (
              <RowMenu>
                <button
                  type="button"
                  onClick={() => setSelected(w)}
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

      <WorkerDrawer worker={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

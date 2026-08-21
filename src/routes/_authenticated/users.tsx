import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, RefreshCw, Search, ShieldCheck, UserCog, X, MoreVertical, UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { useAuth, type AppRole, type ApprovalStatus } from "@/components/auth-context";
import { usePendingApprovals } from "@/components/pending-approvals-context";
import { Avatar, StatusChip,
  PageHeader,
} from "@/components/primitives";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/users")({
  head: () => ({
    meta: [
      { title: "User Management — Kaya AI" },
      {
        name: "description",
        content:
          "Approve new signups, switch roles between Admin and Supervisor, and audit account access across Kaya AI.",
      },
      { property: "og:title", content: "User Management — Kaya AI" },
      {
        property: "og:description",
        content: "Approve pending signups and manage Admin/Supervisor roles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UsersPage,
});

type Row = {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  approval_status: ApprovalStatus;
  created_at: string;
  role: AppRole;
};

const FILTERS = ["Pending", "All", "Approved", "Blocked"] as const;

function initialsOf(name: string | null, email: string | null) {
  const base = (name ?? email ?? "?").trim();
  const parts = base.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function UsersPage() {
  const { roles, user, refreshProfile } = useAuth();
  const { refresh: refreshPendingCount } = usePendingApprovals();
  const isAdmin = roles.includes("admin");

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: profiles, error }, { data: roleRows }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, email, avatar_url, approval_status, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (error) toast.error("Could not load users");
    const roleMap = new Map<string, AppRole>();
    for (const r of (roleRows ?? []) as { user_id: string; role: AppRole }[]) {
      if (r.role === "admin" || !roleMap.has(r.user_id)) roleMap.set(r.user_id, r.role);
    }
    setRows(
      ((profiles ?? []) as Omit<Row, "role">[]).map((p) => ({
        ...p,
        role: roleMap.get(p.id) ?? "supervisor",
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenuId]);

  const setStatus = async (row: Row, status: ApprovalStatus) => {
    setBusyId(row.id);
    const { error } = await supabase
      .from("profiles")
      .update({
        approval_status: status,
        approved_at: status === "approved" ? new Date().toISOString() : null,
        approved_by: status === "approved" ? (user?.id ?? null) : null,
      })
      .eq("id", row.id);
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    
    // Better toast messages based on context and role
    if (status === "approved") {
      if (row.role === "worker") {
        toast.success(`${row.display_name ?? row.email} worker account has been approved (mobile app access granted)`);
      } else {
        toast.success(
          row.approval_status === "rejected"
            ? `${row.display_name ?? row.email} has been unblocked and approved (website access granted)`
            : `${row.display_name ?? row.email} has been approved (website access granted)`
        );
      }
    } else if (status === "rejected") {
      if (row.role === "worker") {
        toast.success(`${row.display_name ?? row.email} worker has been blocked (mobile app access revoked)`);
      } else {
        toast.success(
          row.approval_status === "approved"
            ? `${row.display_name ?? row.email} has been blocked (website access revoked)`
            : `${row.display_name ?? row.email} request has been declined`
        );
      }
    }
    
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, approval_status: status } : r)));
    if (row.id === user?.id) await refreshProfile();
    await refreshPendingCount();
  };

  const setRole = async (row: Row, role: AppRole) => {
    if (role === row.role) return;
    setBusyId(row.id);
    const del = await supabase.from("user_roles").delete().eq("user_id", row.id);
    const ins = del.error
      ? null
      : await supabase.from("user_roles").insert({ user_id: row.id, role });
    setBusyId(null);
    const error = del.error ?? ins?.error;
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${row.display_name ?? row.email} is now ${role}`);
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, role } : r)));
    if (row.id === user?.id) await refreshProfile();
  };

  const pendingCount = rows.filter((r) => r.approval_status === "pending").length;

  const visible = useMemo(
    () =>
      rows.filter((r) => {
        const byFilter =
          filter === "All" ||
          (filter === "Pending" && r.approval_status === "pending") ||
          (filter === "Approved" && r.approval_status === "approved") ||
          (filter === "Blocked" && r.approval_status === "rejected");
        const term = q.toLowerCase();
        return (
          byFilter &&
          `${r.display_name ?? ""} ${r.email ?? ""}`.toLowerCase().includes(term)
        );
      }),
    [rows, filter, q],
  );

  if (!isAdmin) {
    return (
      <div className="panel p-8">
        <h1 className="text-lg font-semibold tracking-tight">Administrator access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only admins can approve signups and change roles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="Accounts, roles and access approvals" />
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <p className="min-w-0 text-sm text-muted-foreground">
          {rows.length} accounts ·{" "}
          <span className={pendingCount ? "font-medium text-warning" : ""}>
            {pendingCount} awaiting approval
          </span>{" "}
          · new signups are blocked until approved
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search users"
              className="h-9 w-52 rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary/60"
            />
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as (typeof FILTERS)[number])}
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm font-medium outline-none focus:border-primary/60"
          >
            {FILTERS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
          <button
            onClick={() => void load()}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
          </button>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["User", "Role", "Access", "Signed up", "Actions"].map((c) => (
                  <th
                    key={c}
                    className="whitespace-nowrap px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-accent/50">
                  <td className="px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar initials={initialsOf(u.display_name, u.email)} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {u.display_name ?? "Unnamed user"}
                          {u.id === user?.id && (
                            <span className="ml-2 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                              you
                            </span>
                          )}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.role === "worker" ? (
                      // Workers: Show role as read-only badge (no dropdown)
                      <div className="inline-flex items-center gap-2">
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Worker</span>
                      </div>
                    ) : (
                      // Supervisors/Admins: Show dropdown to switch between Admin/Supervisor
                      <label className="inline-flex items-center gap-2">
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                        <select
                          value={u.role}
                          disabled={busyId === u.id}
                          onChange={(e) => void setRole(u, e.target.value as AppRole)}
                          className="h-8 rounded-lg border border-border bg-card px-2 text-sm font-medium outline-none focus:border-primary/60 disabled:opacity-60"
                        >
                          <option value="admin">Admin</option>
                          <option value="supervisor">Supervisor</option>
                        </select>
                      </label>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.role === "worker" ? (
                      // Workers: Show approval status (needed for mobile app access)
                      <StatusChip
                        level={
                          u.approval_status === "approved"
                            ? "success"
                            : u.approval_status === "pending"
                              ? "warning"
                              : "critical"
                        }
                      >
                        {u.approval_status === "approved"
                          ? "Approved"
                          : u.approval_status === "pending"
                            ? "Pending approval"
                            : "Blocked"}
                      </StatusChip>
                    ) : (
                      // Supervisors/Admins: Show approval status for website
                      <StatusChip
                        level={
                          u.approval_status === "approved"
                            ? "success"
                            : u.approval_status === "pending"
                              ? "warning"
                              : "critical"
                        }
                      >
                        {u.approval_status === "approved"
                          ? "Approved"
                          : u.approval_status === "pending"
                            ? "Pending approval"
                            : "Blocked"}
                      </StatusChip>
                    )}
                  </td>
                  <td className="num px-4 py-3 text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === u.id ? null : u.id);
                          }}
                          disabled={busyId === u.id}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border transition-colors hover:bg-accent disabled:opacity-60"
                          aria-label="User actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenuId === u.id && (
                          <div 
                            className="absolute right-0 top-10 z-10 w-48 rounded-xl border border-border bg-popover p-1.5 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Workers: Show approve/block options for mobile app access */}
                            {u.role === "worker" ? (
                              <>
                                {u.approval_status !== "approved" && (
                                  <button
                                    onClick={() => {
                                      void setStatus(u, "approved");
                                      setOpenMenuId(null);
                                    }}
                                    disabled={busyId === u.id}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-60"
                                  >
                                    <UserCheck className="h-4 w-4" /> Approve Worker (Mobile App)
                                  </button>
                                )}
                                {u.approval_status === "approved" && (
                                  <button
                                    onClick={() => {
                                      void setStatus(u, "rejected");
                                      setOpenMenuId(null);
                                    }}
                                    disabled={busyId === u.id}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-critical transition-colors hover:bg-critical/10 disabled:opacity-60"
                                  >
                                    <UserX className="h-4 w-4" /> Block Worker (Mobile App)
                                  </button>
                                )}
                                {u.approval_status === "pending" && (
                                  <button
                                    onClick={() => {
                                      void setStatus(u, "rejected");
                                      setOpenMenuId(null);
                                    }}
                                    disabled={busyId === u.id}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-critical transition-colors hover:bg-critical/10 disabled:opacity-60"
                                  >
                                    <X className="h-4 w-4" /> Decline Worker
                                  </button>
                                )}
                              </>
                            ) : (
                              /* Supervisors/Admins: Show approval/block options for website access */
                              <>
                                {u.approval_status !== "approved" && (
                                  <button
                                    onClick={() => {
                                      void setStatus(u, "approved");
                                      setOpenMenuId(null);
                                    }}
                                    disabled={busyId === u.id}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-60"
                                  >
                                    <UserCheck className="h-4 w-4" /> Approve User
                                  </button>
                                )}
                                {u.approval_status === "approved" && u.id !== user?.id && (
                                  <button
                                    onClick={() => {
                                      void setStatus(u, "rejected");
                                      setOpenMenuId(null);
                                    }}
                                    disabled={busyId === u.id}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-critical transition-colors hover:bg-critical/10 disabled:opacity-60"
                                  >
                                    <UserX className="h-4 w-4" /> Block User
                                  </button>
                                )}
                                {u.approval_status === "pending" && (
                                  <button
                                    onClick={() => {
                                      void setStatus(u, "rejected");
                                      setOpenMenuId(null);
                                    }}
                                    disabled={busyId === u.id}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-critical transition-colors hover:bg-critical/10 disabled:opacity-60"
                                  >
                                    <X className="h-4 w-4" /> Decline Request
                                  </button>
                                )}
                                {u.approval_status === "rejected" && (
                                  <button
                                    onClick={() => {
                                      void setStatus(u, "approved");
                                      setOpenMenuId(null);
                                    }}
                                    disabled={busyId === u.id}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-60"
                                  >
                                    <UserCheck className="h-4 w-4" /> Unblock & Approve
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <ShieldCheck className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No accounts match this view.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

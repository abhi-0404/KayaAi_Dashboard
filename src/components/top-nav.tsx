import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronDown, LogOut, MoreHorizontal, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth-context";
import { usePendingApprovals } from "@/components/pending-approvals-context";
import { Avatar } from "@/components/primitives";
import { useRole } from "@/components/role-context";
import { projects } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/*
 * Primary destinations live as pills in the centre of the bar. There are eleven
 * routes in total, which is far more than fits, so the rail is split: the ones
 * a supervisor touches hourly stay visible and the rest move into an overflow
 * menu. Nothing is removed — every route the sidebar exposed is still reachable.
 */
const primary = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Projects", to: "/projects" },
  { label: "Workers", to: "/workers" },
  { label: "Monitoring", to: "/monitoring" },
  { label: "Issues", to: "/issues" },
  { label: "Blueprints", to: "/blueprints" },
] as const;

const overflow = [
  { label: "Tasks", to: "/tasks" },
  { label: "AI Reports", to: "/reports" },
  { label: "Settings", to: "/settings" },
] as const;

const adminOverflow = [
  { label: "User Management", to: "/users" },
  { label: "Blueprint Approval", to: "/blueprint-approval" },
] as const;

/** Closes a popover on outside click and on Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

function NavPill({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-[13.5px] transition-colors duration-150 lg:px-3.5",
        active
          ? "bg-nav-active font-semibold text-foreground"
          : "font-medium text-muted-foreground hover:bg-nav-active/70 hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

export function TopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role, setRole, isAdmin } = useRole();
  const { profile, user, signOut } = useAuth();
  const { count: pendingApprovals } = usePendingApprovals();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [project, setProject] = useState(projects[0]?.name ?? "");
  const [menu, setMenu] = useState(false);
  const [more, setMore] = useState(false);
  const [mobile, setMobile] = useState(false);

  const menuRef = useDismiss(menu, () => setMenu(false));
  const moreRef = useDismiss(more, () => setMore(false));
  const mobileRef = useDismiss(mobile, () => setMobile(false));

  const name = profile?.display_name ?? user?.email ?? "Signed in";
  const email = profile?.email ?? user?.email ?? "";
  const initials =
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U";

  const isActive = (to: string) => pathname.startsWith(to);
  const extras = isAdmin ? [...overflow, ...adminOverflow] : overflow;
  const overflowActive = extras.some((item) => isActive(item.to));

  const handleSignOut = async () => {
    setMenu(false);
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    await navigate({ to: "/", replace: true });
  };

  /*
   * Responsive strategy, by what has to survive rather than by guessed widths:
   *
   *   < md   brand + bell + menu button; every destination in one sheet
   *   md     brand + scrollable pill rail + bell + avatar
   *   lg     avatar gains name and role
   *   xl     search appears
   *   2xl    project selector appears
   *
   * The rail itself is horizontally scrollable and `min-w-0`, so even if a
   * future label is long it scrolls rather than pushing the right-hand cluster
   * off the bar — which is what happened before: eleven pills plus search plus
   * a project select plus a named avatar could not fit 1280px, and the overflow
   * escaped the header instead of collapsing.
   */
  return (
    <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1400px] items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/dashboard" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-[15px] font-bold text-primary-foreground">
            S
          </span>
          <span className="hidden text-[17px] font-bold tracking-tight lg:block">
            Kaya<span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Centred rail. fade-scroll keeps a long rail from looking clipped. */}
        <nav className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto px-1 [scrollbar-width:none] md:flex [&::-webkit-scrollbar]:hidden">
          {primary.map((item) => (
            <NavPill key={item.to} {...item} active={isActive(item.to)} />
          ))}

          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMore((v) => !v)}
              aria-expanded={more}
              aria-haspopup="menu"
              className={cn(
                "flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-[13.5px] transition-colors duration-150",
                overflowActive || more
                  ? "bg-nav-active font-semibold text-foreground"
                  : "font-medium text-muted-foreground hover:bg-nav-active/70 hover:text-foreground",
              )}
            >
              More
              {isAdmin && pendingApprovals > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-critical" />
              )}
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", more && "rotate-180")} />
            </button>
            <div
              role="menu"
              className={cn(
                "absolute left-1/2 top-12 w-56 origin-top -translate-x-1/2 rounded-2xl border border-border bg-popover p-1.5 shadow-raised transition-all duration-150",
                more
                  ? "pointer-events-auto scale-100 opacity-100"
                  : "pointer-events-none scale-95 opacity-0",
              )}
            >
              {extras.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMore(false)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-accent",
                    isActive(item.to)
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                  {item.to === "/users" && pendingApprovals > 0 && (
                    <span className="num grid h-5 min-w-5 place-items-center rounded-full bg-critical px-1.5 text-[10px] font-semibold text-white">
                      {pendingApprovals > 99 ? "99+" : pendingApprovals}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Right cluster */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <label className="relative hidden xl:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search"
              aria-label="Search workers, projects, issues"
              className="h-10 w-44 rounded-full border border-border bg-card pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
            />
          </label>

          <div className="relative hidden 2xl:block">
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              aria-label="Active project"
              className="h-10 appearance-none rounded-full border border-border bg-card pl-4 pr-9 text-sm font-medium outline-none focus:border-primary/50"
            >
              {projects.map((p) => (
                <option key={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          <Link
            to={pendingApprovals > 0 ? "/users" : "/settings"}
            aria-label={
              pendingApprovals > 0
                ? `Notifications: ${pendingApprovals} pending approvals`
                : "Notifications"
            }
            className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            {pendingApprovals > 0 ? (
              <span className="num absolute -right-0.5 -top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-critical px-1 text-[10px] font-semibold text-white ring-2 ring-background">
                {pendingApprovals > 9 ? "9+" : pendingApprovals}
              </span>
            ) : (
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-critical ring-2 ring-card" />
            )}
          </Link>

          {/* Mobile navigation. The pill rail is hidden below md, and the
              overflow menu lives inside it, so this needs its own panel
              carrying every destination rather than just the extras. */}
          <div className="relative md:hidden" ref={mobileRef}>
            <button
              type="button"
              onClick={() => setMobile((v) => !v)}
              aria-expanded={mobile}
              aria-haspopup="menu"
              aria-label="Open navigation"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            <div
              role="menu"
              className={cn(
                "absolute right-0 top-12 max-h-[70vh] w-56 origin-top-right overflow-y-auto rounded-2xl border border-border bg-popover p-1.5 shadow-raised transition-all duration-150",
                mobile
                  ? "pointer-events-auto scale-100 opacity-100"
                  : "pointer-events-none scale-95 opacity-0",
              )}
            >
              {[...primary, ...extras].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobile(false)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-accent",
                    isActive(item.to)
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                  {item.to === "/users" && pendingApprovals > 0 && (
                    <span className="num grid h-5 min-w-5 place-items-center rounded-full bg-critical px-1.5 text-[10px] font-semibold text-white">
                      {pendingApprovals > 99 ? "99+" : pendingApprovals}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenu((v) => !v)}
              aria-expanded={menu}
              aria-haspopup="menu"
              className="flex items-center gap-2.5 rounded-full p-0.5 pr-1 transition-colors hover:bg-accent"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={`${name} profile photo`}
                  className="h-9 w-9 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Avatar initials={initials} size="sm" />
              )}
              {/* <span className="hidden min-w-0 text-left lg:block">
                <span className="block max-w-[9rem] truncate text-[13px] font-semibold leading-tight">
                  {name}
                </span>
                <span className="block text-[11px] leading-tight text-muted-foreground">{role}</span>
              </span> */}
            </button>

            <div
              role="menu"
              className={cn(
                "absolute right-0 top-12 w-60 origin-top-right rounded-2xl border border-border bg-popover p-1.5 shadow-raised transition-all duration-150",
                menu
                  ? "pointer-events-auto scale-100 opacity-100"
                  : "pointer-events-none scale-95 opacity-0",
              )}
            >
              <div className="px-3 py-2">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="truncate text-xs text-muted-foreground">{email}</p>
              </div>
              <div className="my-1 h-px bg-border" />
              <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {isAdmin ? "View as" : "Access level"}
              </p>
              {(["Admin", "Supervisor"] as const).map((r) => (
                <button
                  key={r}
                  disabled={!isAdmin}
                  onClick={() => {
                    setRole(r);
                    setMenu(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent",
                    role === r ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {r}
                  {role === r && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </button>
              ))}
              <div className="my-1 h-px bg-border" />
              <button
                onClick={() => void handleSignOut()}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

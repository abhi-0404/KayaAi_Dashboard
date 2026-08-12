import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Folder,
  Info,
  MoreVertical,
  Search,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { Status } from "@/lib/mock-data";

/*
 * Status colour lives here and nowhere else.
 *
 * Pills are soft-tinted rather than solid so a table of thirty rows does not
 * turn into a colour field — the tint carries the category and the dot carries
 * the signal, which keeps a single critical row visible in a page of valid ones.
 */
const tone: Record<Status, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/14 text-warning-foreground/85",
  critical: "bg-critical/10 text-critical",
  idle: "bg-muted text-muted-foreground",
};

const dotTone: Record<Status, string> = {
  success: "bg-success",
  warning: "bg-warning",
  critical: "bg-critical",
  idle: "bg-muted-foreground/50",
};

export function StatusDot({
  level,
  pulse = false,
  className,
}: {
  level: Status;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex h-1.5 w-1.5 shrink-0", className)}>
      {pulse && (
        <span
          className={cn("absolute inset-0 animate-ping rounded-full opacity-60", dotTone[level])}
        />
      )}
      <span className={cn("relative h-1.5 w-1.5 rounded-full", dotTone[level])} />
    </span>
  );
}

export function StatusChip({
  level,
  children,
  dot = true,
  className,
}: {
  level: Status;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium",
        tone[level],
        className,
      )}
    >
      {dot && <StatusDot level={level} />}
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  level = "success",
  className,
}: {
  value: number;
  level?: Status;
  className?: string;
}) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", dotTone[level])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function BatteryPill({ value }: { value: number }) {
  const level: Status =
    value === 0 ? "idle" : value < 20 ? "critical" : value < 45 ? "warning" : "success";
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-3.5 w-7 rounded-[4px] border border-border">
        <div
          className={cn("absolute inset-y-0.5 left-0.5 rounded-[2px]", dotTone[level])}
          style={{ width: `${Math.max(4, (value / 100) * 22)}px` }}
        />
      </div>
      <span className="num text-xs font-medium text-muted-foreground">{value}%</span>
    </div>
  );
}

export function Avatar({
  initials,
  size = "md",
  level,
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
  level?: Status;
}) {
  const sizes = {
    sm: "h-9 w-9 text-[11px]",
    md: "h-10 w-10 text-xs",
    lg: "h-14 w-14 text-base",
  };
  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          "grid place-items-center rounded-full bg-foreground/[0.05] font-semibold text-foreground/75",
          sizes[size],
        )}
      >
        {initials}
      </div>
      {level && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card",
            dotTone[level],
          )}
        />
      )}
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      <div className="min-w-0">
        <h2 className="truncate text-[15px] font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page scaffolding                                                    */
/* ------------------------------------------------------------------ */

/**
 * The page title now lives in the body rather than the top bar, so the bar can
 * carry navigation instead. Every route renders one of these as its first child.
 */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-6">
      <div className="min-w-0">
        <h1 className="page-title truncate">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({
  children,
  icon: Icon,
  onClick,
  to,
  className,
}: {
  children: ReactNode;
  icon?: typeof Info;
  onClick?: () => void;
  to?: string;
  className?: string;
}) {
  const styles = cn(
    "inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-strong",
    className,
  );
  if (to) {
    return (
      <Link to={to} className={styles}>
        {Icon && <Icon className="h-4 w-4" />}
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={styles}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function Panel({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return <div className={cn("panel min-w-0", padded && "p-5", className)}>{children}</div>;
}

/** Summary tile with a corner link, mirroring the folder cards in the reference. */
export function FolderCard({
  title,
  meta,
  to,
  icon: Icon = Folder,
  tint,
}: {
  title: string;
  meta: string;
  to?: string;
  icon?: typeof Folder;
  tint?: Status;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between">
        <Icon
          className={cn(
            "h-7 w-7",
            tint ? dotTone[tint].replace("bg-", "text-") : "text-muted-foreground/45",
          )}
          strokeWidth={1.5}
        />
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-8 text-[15px] font-semibold tracking-tight">{title}</p>
      <p className="num mt-1 text-[13px] text-muted-foreground">{meta}</p>
    </>
  );

  if (to) {
    return (
      <Link to={to} className="panel group block p-5 transition-shadow hover:shadow-raised">
        {body}
      </Link>
    );
  }
  return <div className="panel group p-5">{body}</div>;
}

/** Big number + label, used in the compliance-style summary blocks. */
export function StatFigure({
  value,
  label,
  className,
}: {
  value: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="num text-[28px] font-bold leading-none tracking-tight">{value}</span>
      <span className="text-[13px] text-muted-foreground">{label}</span>
    </div>
  );
}

/** Small bordered count chip — "5 Expired", "23 Incomplete". */
export function CountChip({
  value,
  label,
  level = "idle",
}: {
  value: ReactNode;
  label: string;
  level?: Status;
}) {
  return (
    <div className="well flex-1 px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <StatusDot level={level} />
        <span className="num text-[15px] font-semibold leading-none">{value}</span>
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

export type Segment = { value: number; level: Status; label?: string };

/** Proportional bar broken into labelled segments. */
export function SegmentBar({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  return (
    <div>
      <div className="flex gap-1.5">
        {segments.map((segment, i) => (
          <div key={i} style={{ width: `${(segment.value / total) * 100}%` }}>
            <p className="num mb-1.5 text-[13px] font-semibold">
              {Math.round((segment.value / total) * 100)}%
            </p>
            <div className={cn("h-1 rounded-full", dotTone[segment.level])} />
          </div>
        ))}
      </div>
      {segments.some((s) => s.label) && (
        <div className="mt-2 flex gap-1.5">
          {segments.map((segment, i) => (
            <p
              key={i}
              style={{ width: `${(segment.value / total) * 100}%` }}
              className="truncate text-[11px] text-muted-foreground"
            >
              {segment.label}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Ticked radial gauge for the brand panel.
 *
 * Drawn as discrete ticks rather than an arc because at a glance the tick count
 * reads as a measured quantity, which is what a capacity figure is.
 */
export function RadialGauge({
  percent,
  primaryLabel,
  secondaryLabel,
  ticks = 64,
}: {
  percent: number;
  primaryLabel: string;
  secondaryLabel?: string;
  ticks?: number;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  const lit = Math.round((clamped / 100) * ticks);
  return (
    <div className="relative grid h-40 w-40 shrink-0 place-items-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {Array.from({ length: ticks }).map((_, i) => {
          const angle = (i / ticks) * 2 * Math.PI - Math.PI / 2;
          const inner = i < lit ? 36 : 39;
          return (
            <line
              key={i}
              x1={50 + Math.cos(angle) * inner}
              y1={50 + Math.sin(angle) * inner}
              x2={50 + Math.cos(angle) * 46}
              y2={50 + Math.sin(angle) * 46}
              stroke="currentColor"
              strokeWidth={1.4}
              strokeLinecap="round"
              opacity={i < lit ? 0.95 : 0.28}
            />
          );
        })}
      </svg>
      <div className="relative text-center">
        <p className="num text-[30px] font-bold leading-none">
          {Math.round(clamped)}
          <span className="text-base font-semibold">%</span>
        </p>
        <p className="num mt-1.5 text-[12px] opacity-85">{primaryLabel}</p>
        {secondaryLabel && <p className="text-[11px] opacity-70">{secondaryLabel}</p>}
      </div>
    </div>
  );
}

/** Dismissible inline notice. */
export function AlertBanner({
  children,
  level = "warning",
}: {
  children: ReactNode;
  level?: Status;
}) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className={cn("flex items-start gap-2.5 rounded-2xl px-3.5 py-3", tone[level])}>
      <Info className="mt-px h-4 w-4 shrink-0" />
      <p className="flex-1 text-[12.5px] leading-relaxed">{children}</p>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Dismiss"
        className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Data table                                                          */
/* ------------------------------------------------------------------ */

export type Column<T> = {
  key: string;
  header: string;
  /** Rendered cell. Keep it to one line — rows are a fixed height. */
  cell: (row: T) => ReactNode;
  /** Shows the sort affordance and makes the header clickable. */
  sortable?: boolean;
  /** Comparator used when this column is the active sort. */
  compare?: (a: T, b: T) => number;
  className?: string;
};

/**
 * The list surface used across every page: selectable rows, sortable headers,
 * a per-row menu and a bulk action bar that appears only once something is
 * selected. One implementation so a worker list and a document list do not
 * drift apart visually.
 */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  onRowClick,
  selectable = true,
  bulkActions,
  rowMenu,
  empty = "Nothing to show.",
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  bulkActions?: (selected: T[], clear: () => void) => ReactNode;
  rowMenu?: (row: T) => ReactNode;
  empty?: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [asc, setAsc] = useState(true);

  const sortColumn = columns.find((c) => c.key === sortKey);
  const ordered =
    sortColumn?.compare
      ? [...rows].sort((a, b) => (asc ? 1 : -1) * sortColumn.compare!(a, b))
      : rows;

  const allSelected = ordered.length > 0 && ordered.every((r) => selected.has(rowKey(r)));
  const clear = () => setSelected(new Set());

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(ordered.map(rowKey)));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const sortBy = (column: Column<T>) => {
    if (!column.sortable || !column.compare) return;
    if (sortKey === column.key) setAsc((v) => !v);
    else {
      setSortKey(column.key);
      setAsc(true);
    }
  };

  const selectedRows = ordered.filter((r) => selected.has(rowKey(r)));

  return (
    // min-w-0 is load-bearing: grid and flex children default to
    // `min-width: auto`, so the min-width on the table below would otherwise
    // expand its whole track and push the page into horizontal scroll instead
    // of scrolling inside this container.
    <div className="min-w-0">
      {selectable && selectedRows.length > 0 && bulkActions && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl bg-primary/8 px-4 py-2.5">
          <span className="num text-[13px] font-semibold">
            {selectedRows.length} selected
          </span>
          <div className="ml-auto flex items-center gap-2">
            {bulkActions(selectedRows, clear)}
            <button
              type="button"
              onClick={clear}
              className="text-[12px] font-medium text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              {selectable && (
                <th className="w-10 py-3 pl-1 text-left">
                  <Checkbox checked={allSelected} onChange={toggleAll} label="Select all rows" />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "py-3 pr-4 text-left text-[12.5px] font-medium text-muted-foreground",
                    column.className,
                  )}
                >
                  {column.sortable && column.compare ? (
                    <button
                      type="button"
                      onClick={() => sortBy(column)}
                      className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                    >
                      {column.header}
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform",
                          sortKey === column.key && !asc && "rotate-180",
                          sortKey === column.key ? "text-foreground" : "opacity-50",
                        )}
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
              {rowMenu && <th className="w-10" />}
            </tr>
          </thead>
          <tbody>
            {ordered.map((row) => {
              const id = rowKey(row);
              return (
                <tr
                  key={id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-border/70 last:border-0",
                    onRowClick && "cursor-pointer transition-colors hover:bg-accent/50",
                  )}
                >
                  {selectable && (
                    <td className="py-3.5 pl-1" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.has(id)}
                        onChange={() => toggle(id)}
                        label={`Select row ${id}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn("py-3.5 pr-4 text-[13.5px]", column.className)}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                  {rowMenu && (
                    <td className="py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      {rowMenu(row)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {ordered.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "grid h-4.5 w-4.5 shrink-0 place-items-center rounded-[5px] border transition-colors",
        checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
      )}
    >
      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
    </button>
  );
}

/** Row overflow menu trigger. Consumers supply the menu content. */
export function RowMenu({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        aria-label="Row actions"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && children && (
        <div className="absolute right-0 top-9 z-10 w-44 rounded-xl border border-border bg-popover p-1.5 text-left shadow-raised">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Toolbar above a table: segmented actions on the left, search and sort on the
 * right, matching the reference's Import / Renew / Complete row.
 */
export function TableToolbar({
  actions,
  query,
  onQuery,
  sort,
  placeholder = "Search…",
}: {
  actions?: ReactNode;
  query?: string;
  onQuery?: (next: string) => void;
  sort?: ReactNode;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions && <div className="flex items-center gap-2">{actions}</div>}
      <div className="ml-auto flex items-center gap-2">
        {onQuery && (
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query ?? ""}
              onChange={(event) => onQuery(event.target.value)}
              placeholder={placeholder}
              className="h-10 w-40 rounded-full border border-border bg-card pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:w-52 focus:border-primary/50"
            />
          </label>
        )}
        {sort}
      </div>
    </div>
  );
}

/** Neutral pill button used for secondary table actions. */
export function GhostButton({
  children,
  icon: Icon,
  onClick,
  active,
}: {
  children: ReactNode;
  icon?: typeof Info;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-card text-foreground hover:bg-accent",
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

/** Segmented control used above tables. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "h-10 rounded-full px-4 text-sm font-medium transition-colors",
            option === value
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-foreground hover:bg-accent",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

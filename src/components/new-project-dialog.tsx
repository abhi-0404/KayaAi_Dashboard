/**
 * Site setup.
 *
 * The field app reads the project hierarchy but never authors it, so until a
 * supervisor creates a site here the database is empty and every surface — phone
 * and laptop — has nothing to show. This is the front door for real data.
 *
 * Levels and zones are created in the same pass on purpose: the app resolves its
 * context down to a zone, and a project with no zones leaves a worker unable to
 * say where they are.
 */
import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";

import { createProject } from "@/lib/site-admin";
import { refreshLiveData } from "@/lib/live-store";
import { cn } from "@/lib/utils";

type LevelDraft = { name: string; number: number; zones: string };

const BLANK_LEVEL: LevelDraft = { name: "", number: 1, zones: "" };

export function NewProjectDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [client, setClient] = useState("");
  const [location, setLocation] = useState("");
  const [phase, setPhase] = useState("");
  const [description, setDescription] = useState("");
  const [levels, setLevels] = useState<LevelDraft[]>([{ ...BLANK_LEVEL }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const reset = () => {
    setName("");
    setCode("");
    setClient("");
    setLocation("");
    setPhase("");
    setDescription("");
    setLevels([{ ...BLANK_LEVEL }]);
    setError(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Give the project a name.");
      return;
    }
    const named = levels.filter((l) => l.name.trim());
    if (named.length === 0) {
      setError("Add at least one level so the field app has somewhere to point.");
      return;
    }

    setBusy(true);
    setError(null);

    const result = await createProject({
      name,
      code,
      client,
      location,
      phase,
      description,
      levels: named.map((l) => ({
        name: l.name,
        number: l.number,
        // Comma-separated is the fastest way to enter half a dozen zones.
        zones: l.zones
          .split(",")
          .map((z) => z.trim())
          .filter(Boolean),
      })),
    });

    setBusy(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    // Realtime covers this, but refreshing removes the flicker of an empty list.
    void refreshLiveData();
    onCreated?.(result.data.id);
    reset();
    onClose();
  };

  const field =
    "mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm outline-none transition-colors focus:border-primary/50 focus:bg-card";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/25 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New project"
        className="panel max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6 shadow-raised"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[19px] font-bold tracking-tight">New project</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Creates the site the phones will sync against.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={(e) => void submit(e)} className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Project name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Meridian Tower"
                className={field}
                required
                disabled={busy}
              />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Code
              </span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="MT-001"
                className={field}
                disabled={busy}
              />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Client
              </span>
              <input
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className={field}
                disabled={busy}
              />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Location
              </span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Delhi"
                className={field}
                disabled={busy}
              />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Phase
              </span>
              <input
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                placeholder="MEP rough-in"
                className={field}
                disabled={busy}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Description
              </span>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={field}
                disabled={busy}
              />
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold">Levels and zones</p>
              <button
                type="button"
                onClick={() => setLevels((l) => [...l, { ...BLANK_LEVEL, number: l.length + 1 }])}
                disabled={busy}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Add level
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {levels.map((level, index) => (
                <div key={index} className="well grid gap-2.5 p-3 sm:grid-cols-[1fr_5rem_2fr_auto]">
                  <input
                    value={level.name}
                    onChange={(e) =>
                      setLevels((all) =>
                        all.map((l, i) => (i === index ? { ...l, name: e.target.value } : l)),
                      )
                    }
                    placeholder="Level 14"
                    aria-label={`Level ${index + 1} name`}
                    className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary/50"
                    disabled={busy}
                  />
                  <input
                    type="number"
                    value={level.number}
                    onChange={(e) =>
                      setLevels((all) =>
                        all.map((l, i) =>
                          i === index ? { ...l, number: Number(e.target.value) } : l,
                        ),
                      )
                    }
                    aria-label={`Level ${index + 1} storey number`}
                    className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary/50"
                    disabled={busy}
                  />
                  <input
                    value={level.zones}
                    onChange={(e) =>
                      setLevels((all) =>
                        all.map((l, i) => (i === index ? { ...l, zones: e.target.value } : l)),
                      )
                    }
                    placeholder="Zone A, Zone B, Core"
                    aria-label={`Level ${index + 1} zones`}
                    className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary/50"
                    disabled={busy}
                  />
                  <button
                    type="button"
                    onClick={() => setLevels((all) => all.filter((_, i) => i !== index))}
                    disabled={busy || levels.length === 1}
                    aria-label={`Remove level ${index + 1}`}
                    className="grid h-10 w-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Zones are comma separated. Storey numbers go negative for basements.
            </p>
          </div>

          {error && (
            <p className="rounded-xl bg-critical/8 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-critical">
              {error}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="h-11 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-strong",
                busy && "opacity-70",
              )}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Create project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

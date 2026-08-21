import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HardHat, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password - Kaya AI" },
      {
        name: "description",
        content: "Set a new password for your Kaya AI construction command center account.",
      },
      { property: "og:title", content: "Reset password - Kaya AI" },
      {
        property: "og:description",
        content: "Choose a new password to regain access to your Kaya AI account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    void (async () => {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        setBusy(false);
        return;
      }
      setDone(true);
      setBusy(false);
      setTimeout(() => void navigate({ to: "/dashboard", replace: true }), 1200);
    })();
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary">
            <HardHat className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Kaya AI</span>
        </div>

        <h1 className="mt-8 text-2xl font-semibold tracking-tight">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a password with at least 8 characters to finish resetting your account.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-3">
          <div>
            <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="text-xs font-medium text-muted-foreground">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Update password
          </button>
        </form>

        {error && (
          <p className="mt-3 rounded-lg border border-critical/30 bg-critical/5 px-3 py-2 text-xs text-critical">
            {error}
          </p>
        )}
        {done && (
          <p className="mt-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
            Password updated. Taking you to the dashboard…
          </p>
        )}
      </div>
    </div>
  );
}

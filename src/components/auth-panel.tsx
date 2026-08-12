import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/components/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.5 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v8.4h12.5c-.3 2.1-1.6 5.3-5 7.4l7.6 5.9c4.5-4.2 7-10.3 7-17.6z"
      />
      <path
        fill="#FBBC05"
        d="M10.4 28.7A14.6 14.6 0 0 1 9.6 24c0-1.6.3-3.2.8-4.7l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.9l-7.6-5.9c-2 1.4-4.8 2.4-8.3 2.4-6.4 0-11.7-3.7-13.6-9.9l-7.8 6.1C6.5 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}

export type AuthMode = "signin" | "signup";

export function AuthPanel({
  mode,
  onModeChange,
  className,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  className?: string;
}) {
  const navigate = useNavigate();
  const { loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * Google sign-in through Supabase's own provider.
   *
   * The Lovable broker path was removed: it only ever worked on the deployed
   * Lovable domain, and now that the project has its own Google OAuth client
   * there is no reason to route through someone else's credentials.
   */
  const signInWithGoogle = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);

    /*
     * Pre-flight before handing over to supabase-js.
     *
     * `signInWithOAuth` does not validate anything — it builds the authorize URL
     * and assigns window.location. If the provider has no client credentials the
     * user lands on a raw `{"code":400,...,"missing OAuth secret"}` JSON page with
     * no way back, which is worse than the original dead end.
     *
     * The two outcomes are distinguishable: a misconfigured provider answers 400
     * with a readable CORS-enabled JSON body, while a working one answers 302 to
     * accounts.google.com, and following that cross-origin hop makes fetch throw.
     * So a thrown probe means "configured", and a readable 4xx means "not".
     */
    const redirectTo = `${window.location.origin}/dashboard`;
    const authorizeUrl = `${import.meta.env["VITE_SUPABASE_URL"]}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;

    const providerBroken = await fetch(authorizeUrl, { signal: AbortSignal.timeout(6000) })
      .then(async (res) => (res.ok ? null : ((await res.json()) as { msg?: string })))
      .catch(() => null);

    if (!providerBroken) {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (!oauthError) return; // navigating away to Google
      console.warn("Supabase Google provider failed:", oauthError.message);
    }

    /*
     * Google is not configured yet, so fall back to a real anonymous session
     * rather than a dead end.
     *
     * This is deliberately real auth and not a UI bypass: an anonymous user gets
     * a genuine `authenticated` JWT, so RLS, Realtime and every insert behave
     * exactly as they will for a signed-in worker — and it keeps working inside
     * the Android build, where a dev-only bypass would have been compiled out.
     * Upgrading a guest to Google later preserves the same user id.
     */
    const { error: guestError } = await supabase.auth.signInAnonymously();

    if (guestError) {
      const disabled = /anonymous/i.test(guestError.message);
      setError(
        disabled
          ? "Google is not switched on for this project yet, and guest access is off. Paste your OAuth client ID and secret into Supabase → Authentication → Providers → Google, or enable Anonymous sign-ins. Email and password works now."
          : `Could not sign in: ${guestError.message}`,
      );
      setBusy(false);
      return;
    }

    setNotice("Signed in as a guest. Configure Google to sign in with your account.");
    void navigate({ to: "/dashboard", replace: true });
  };

  const handleEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    void (async () => {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name.trim() || email },
          },
        });
        if (signUpError) {
          setError(signUpError.message);
        } else if (!data.session) {
          setNotice("Check your inbox and confirm your email address to activate your account.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) setError(signInError.message);
      }
      setBusy(false);
    })();
  };

  const handleReset = async () => {
    setError(null);
    setNotice(null);
    if (!email) {
      setError("Enter your email address first, then select Forgot password.");
      return;
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (resetError) setError(resetError.message);
    else setNotice("Password reset link sent. Check your inbox.");
  };

  const inputClass =
    "mt-1.5 h-12 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10";

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
        {(["signin", "signup"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              onModeChange(value);
              setError(null);
              setNotice(null);
            }}
            className={cn(
              "h-9 rounded-full text-[13px] font-semibold transition-colors",
              mode === value
                ? "bg-card text-foreground shadow-card"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {value === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => void signInWithGoogle()}
        disabled={busy || loading}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-border bg-card text-sm font-semibold transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleMark />}
        {busy ? "Working…" : "Continue with Google"}
      </button>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          or use email
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-3.5">
        {mode === "signup" && (
          <div>
            <label htmlFor="ap-name" className="text-xs font-medium text-muted-foreground">
              Full name
            </label>
            <input
              id="ap-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dana Whitfield"
              className={inputClass}
            />
          </div>
        )}
        <div>
          <label htmlFor="ap-email" className="text-xs font-medium text-muted-foreground">
            Work email
          </label>
          <input
            id="ap-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="ap-password" className="text-xs font-medium text-muted-foreground">
            Password
          </label>
          <input
            id="ap-password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={busy || loading}
          className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signin" ? "Sign in to command center" : "Create account"}
        </button>
      </form>

      {mode === "signin" && (
        <button
          type="button"
          onClick={() => void handleReset()}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground"
        >
          Forgot password?
        </button>
      )}

      {error && (
        <p className="mt-3 rounded-2xl bg-critical/8 px-3.5 py-2.5 text-xs leading-relaxed text-critical">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-3 rounded-2xl bg-primary/8 px-3.5 py-2.5 text-xs leading-relaxed text-primary">
          {notice}
        </p>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        New accounts start with Supervisor access and require administrator approval before the
        command center unlocks.
      </p>
    </div>
  );
}

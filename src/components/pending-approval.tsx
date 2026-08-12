import { Clock, LogOut, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/components/auth-context";

export function PendingApproval({ rejected = false }: { rejected?: boolean }) {
  const { profile, refreshProfile, signOut } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    await refreshProfile();
    setChecking(false);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <div className="panel w-full max-w-lg p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
            {rejected ? <ShieldAlert className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Kaya AI · Access control
            </p>
            <h1 className="text-lg font-semibold tracking-tight">
              {rejected ? "Access request declined" : "Waiting for admin approval"}
            </h1>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          {rejected ? (
            <>
              An administrator declined access for{" "}
              <span className="font-medium text-foreground">{profile?.email}</span>. Contact your
              site administrator if you believe this is a mistake.
            </>
          ) : (
            <>
              Your account{" "}
              <span className="font-medium text-foreground">{profile?.email}</span> was created
              successfully. An administrator must approve it from User Management before you can
              enter the command center.
            </>
          )}
        </p>

        {!rejected && (
          <ul className="mt-5 space-y-2 text-sm text-foreground/80">
            {[
              "Account created and secured",
              "Awaiting administrator approval",
              "Role and project access assigned on approval",
            ].map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <ShieldCheck
                  className={i === 0 ? "h-4 w-4 text-success" : "h-4 w-4 text-muted-foreground/50"}
                />
                {step}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-2">
          {!rejected && (
            <button
              onClick={handleCheck}
              disabled={checking}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              <RefreshCw className={checking ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Check approval status
            </button>
          )}
          <button
            onClick={() => void signOut()}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { useAuth } from "@/components/auth-context";
import { PendingApproval } from "@/components/pending-approval";
import { PendingApprovalsProvider } from "@/components/pending-approvals-context";
import { RoleProvider } from "@/components/role-context";
import { TopNav } from "@/components/top-nav";
import { supabase } from "@/integrations/supabase/client";
import { DEV_AUTH_BYPASS } from "@/lib/dev-auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Dev-build-only escape hatch; see src/lib/dev-auth.ts for the guards.
    if (DEV_AUTH_BYPASS) return { user: null };
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { profileLoading, approvalStatus } = useAuth();

  if (profileLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Verifying access…</p>
      </div>
    );
  }

  if (approvalStatus === "pending") return <PendingApproval />;
  if (approvalStatus === "rejected") return <PendingApproval rejected />;

  return (
    <RoleProvider>
      <PendingApprovalsProvider>
        {/* Navigation moved from a fixed 280px rail into the top bar, so the
            content is centred on the canvas instead of offset. */}
        <div className="min-h-screen bg-background">
          {DEV_AUTH_BYPASS && (
            <div className="hazard-tape flex items-center justify-center px-4 py-3">
              {/* <p className="rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold tracking-wide">
                DEV AUTH BYPASS ACTIVE — not signed in, nothing here is access-controlled
              </p> */}
            </div>
          )}
          <TopNav />
          <main className="mx-auto max-w-[1400px] px-4 pb-14 pt-2 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </PendingApprovalsProvider>
    </RoleProvider>
  );
}

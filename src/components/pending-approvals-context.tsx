import { useNavigate } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-context";
import { supabase } from "@/integrations/supabase/client";

type PendingValue = {
  count: number;
  loading: boolean;
  refresh: () => Promise<void>;
};

const PendingContext = createContext<PendingValue>({
  count: 0,
  loading: false,
  refresh: async () => {},
});

const POLL_MS = 30_000;

export function PendingApprovalsProvider({ children }: { children: ReactNode }) {
  const { roles, approvalStatus } = useAuth();
  const isAdmin = roles.includes("admin") && approvalStatus === "approved";
  const navigate = useNavigate();

  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const seen = useRef<number | null>(null);
  const notified = useRef(false);

  const announce = useCallback(
    (next: number) => {
      toast.warning(
        next === 1 ? "1 user is waiting for approval" : `${next} users are waiting for approval`,
        {
          id: "pending-approvals",
          description: "Review the request in User Management to grant access.",
          duration: 8000,
          action: {
            label: "Review",
            onClick: () => void navigate({ to: "/users" }),
          },
        },
      );
    },
    [navigate],
  );

  const refresh = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    const { count: next, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "pending");
    setLoading(false);
    if (error) return;

    const value = next ?? 0;
    const previous = seen.current;
    seen.current = value;
    setCount(value);

    if (value === 0) {
      notified.current = false;
      toast.dismiss("pending-approvals");
      return;
    }
    // Announce on first load, and again whenever new requests arrive.
    if (previous === null ? !notified.current : value > previous) {
      notified.current = true;
      announce(value);
    }
  }, [isAdmin, announce]);

  useEffect(() => {
    if (!isAdmin) {
      setCount(0);
      seen.current = null;
      notified.current = false;
      return;
    }

    void refresh();
    const id = window.setInterval(() => void refresh(), POLL_MS);

    const channel = supabase
      .channel("pending-approvals")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => void refresh(),
      )
      .subscribe();

    return () => {
      window.clearInterval(id);
      void supabase.removeChannel(channel);
    };
  }, [isAdmin, refresh]);

  return (
    <PendingContext.Provider value={{ count, loading, refresh }}>{children}</PendingContext.Provider>
  );
}

export function usePendingApprovals() {
  return useContext(PendingContext);
}

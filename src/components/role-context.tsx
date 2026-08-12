import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { useAuth } from "@/components/auth-context";

type Role = "Admin" | "Supervisor";

const RoleContext = createContext<{ role: Role; setRole: (r: Role) => void; isAdmin: boolean }>({
  role: "Supervisor",
  setRole: () => {},
  isAdmin: false,
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const { roles } = useAuth();
  const isAdmin = roles.includes("admin");
  const [role, setRole] = useState<Role>("Supervisor");

  useEffect(() => {
    setRole(isAdmin ? "Admin" : "Supervisor");
  }, [isAdmin]);

  // Admins may preview the Supervisor experience; supervisors cannot escalate.
  const applyRole = (next: Role) => setRole(isAdmin ? next : "Supervisor");

  return (
    <RoleContext.Provider value={{ role, setRole: applyRole, isAdmin }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}

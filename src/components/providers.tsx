"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { mockUsers, type MockUser } from "@/lib/mock-data";

interface AuthContextValue {
  user: MockUser | null;
  setRole: (role: "buyer" | "seller" | "admin") => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  setRole: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser>(mockUsers.buyer);

  function setRole(role: "buyer" | "seller" | "admin") {
    setUser(mockUsers[role]);
  }

  return (
    <AuthContext.Provider value={{ user, setRole, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

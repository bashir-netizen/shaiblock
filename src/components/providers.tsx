"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { mockUsers, type MockUser } from "@/lib/mock-data";

interface AuthContextValue {
  user: MockUser;
  setRole: (role: "buyer" | "seller" | "admin") => void;
  isAuthenticated: boolean;
}

// Null default so `useAuth` outside a provider throws rather than returning
// a silently-broken stub. The type is non-null inside the provider since
// we always seed with a mock user.
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser>(mockUsers.buyer);

  function setRole(role: "buyer" | "seller" | "admin") {
    setUser(mockUsers[role]);
  }

  return (
    <AuthContext.Provider value={{ user, setRole, isAuthenticated: true }}>
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

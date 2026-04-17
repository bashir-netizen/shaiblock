"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const AUTH_KEY = "shaiblock_logged_in";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem(AUTH_KEY) === "true");
  }, []);

  const login = useCallback(() => {
    localStorage.setItem(AUTH_KEY, "true");
    setIsLoggedIn(true);
    router.push("/auctions");
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setIsLoggedIn(false);
    router.push("/");
  }, [router]);

  return { isLoggedIn, login, logout };
}

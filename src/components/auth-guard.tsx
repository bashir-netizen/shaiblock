"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn === false) {
      router.replace("/");
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn === null || isLoggedIn === false) {
    return null;
  }

  return <>{children}</>;
}

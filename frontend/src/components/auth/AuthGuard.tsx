"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useAppSelector } from "@/redux/hooks";

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const token = Cookies.get("hrms_access_token");
    const isAuthRoute =
      pathname.startsWith("/login") || pathname.startsWith("/register");

    if (!token && !isAuthenticated && !isAuthRoute) {
      router.replace("/login");
    } else if (token && isAuthRoute) {
      router.replace("/");
    }
  }, [pathname, isAuthenticated, router]);

  return <>{children}</>;
};

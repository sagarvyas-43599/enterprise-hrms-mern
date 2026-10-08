"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { Toaster } from "sonner";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { setTheme } from "@/redux/slices/uiSlice";

function ThemeSynchronizer({ children }: { children: React.ReactNode }) {
  const theme = useAppSelector((state) => state.ui.theme);
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = React.useState(false);

  // Initialize theme from localStorage on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      dispatch(setTheme(savedTheme));
    }
    setMounted(true);
  }, [dispatch]);

  // Sync to localStorage and DOM when theme changes
  React.useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, mounted]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeSynchronizer>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: "14px",
              fontSize: "13px",
            },
          }}
        />
      </ThemeSynchronizer>
    </Provider>
  );
}

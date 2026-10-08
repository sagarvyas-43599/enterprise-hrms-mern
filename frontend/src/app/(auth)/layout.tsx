import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8">
      {/* Spacer */}
      <div className="h-4 sm:h-8" />

      {/* Main Centered Card Container */}
      <main className="flex-1 flex items-center justify-center py-6">
        <div className="w-full max-w-[460px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-10 transition-all">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center pb-4 text-xs text-slate-400 dark:text-slate-500">
        &copy; {new Date().getFullYear()} Enterprise HRMS Portal. All rights reserved.
      </footer>
    </div>
  );
}

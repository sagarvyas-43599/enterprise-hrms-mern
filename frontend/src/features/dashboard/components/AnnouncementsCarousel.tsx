"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Megaphone, ChevronLeft, ChevronRight, ArrowUpRight, Send, BellOff } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { useGetNotificationsQuery, type AppNotification } from "@/redux/services/notificationApi";

const ROTATE_MS = 6000;
const MAX_SLIDES = 6;

const PRIORITY_STYLE: Record<AppNotification["priority"], string> = {
  URGENT: "bg-rose-500/20 text-rose-200 border-rose-400/30",
  HIGH: "bg-amber-500/20 text-amber-200 border-amber-400/30",
  MEDIUM: "bg-sky-500/20 text-sky-200 border-sky-400/30",
  LOW: "bg-white/10 text-slate-200 border-white/20",
};

const relativeTime = (iso: string): string => {
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

export const AnnouncementsCarousel: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const canBroadcast = user?.role === "SUPER_ADMIN" || user?.role === "HR_ADMIN";
  const { data, isLoading } = useGetNotificationsQuery(undefined, { pollingInterval: 3 * 60 * 1000 });

  const slides = useMemo(() => {
    const all = data?.data?.notifications ?? [];
    const corporate = all.filter((n) => n.type === "ANNOUNCEMENT" || n.type === "POLICY_MANDATE" || n.type === "ALERT");
    return (corporate.length ? corporate : all).slice(0, MAX_SLIDES);
  }, [data]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (slides.length ? (i + dir + slides.length) % slides.length : 0)),
    [slides.length]
  );

  // Clamp when data shrinks
  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [slides.length, index]);

  // Auto-rotate (pauses on hover / focus, respects reduced-motion)
  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => go(1), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused, slides.length, go]);

  const current = slides[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Company announcements"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 text-white shadow-lg"
    >
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-fuchsia-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-sky-300/20 blur-3xl" />

      <div className="relative flex items-center gap-4 p-4 sm:p-5">
        <div className="hidden sm:flex shrink-0 w-11 h-11 rounded-xl bg-white/15 backdrop-blur items-center justify-center border border-white/20">
          <Megaphone className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0" aria-live={paused ? "polite" : "off"}>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-white/20 animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-white/20 animate-pulse" />
            </div>
          ) : !current ? (
            <div className="flex items-center gap-2 text-sm text-white/80">
              <BellOff className="w-4 h-4" />
              No company announcements right now.
            </div>
          ) : (
            <div key={current._id} className="animate-slide-fade">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${PRIORITY_STYLE[current.priority]}`}>
                  {current.type.replace("_", " ")}
                </span>
                <span className="text-[10px] text-white/60">
                  {current.senderName ? `${current.senderName} · ` : ""}
                  {relativeTime(current.createdAt)}
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold truncate">{current.title}</p>
              <p className="text-xs text-white/75 truncate">{current.message}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {current?.actionLink && (
            <Link
              href={current.actionLink}
              className="hidden md:inline-flex items-center gap-1 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 text-xs font-semibold transition-colors"
            >
              Open <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
          {canBroadcast && (
            <Link
              href="/notifications"
              id="broadcast-announcement-link"
              className="hidden md:inline-flex items-center gap-1 rounded-lg bg-white text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 text-xs font-bold transition-colors"
            >
              <Send className="w-3.5 h-3.5" /> Broadcast
            </Link>
          )}
          {slides.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                id="announcement-prev"
                aria-label="Previous announcement"
                onClick={() => go(-1)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="announcement-next"
                aria-label="Next announcement"
                onClick={() => go(1)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="relative flex justify-center gap-1.5 pb-3" role="tablist">
          {slides.map((s, i) => (
            <button
              key={s._id}
              role="tab"
              aria-selected={i === index}
              aria-label={`Announcement ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

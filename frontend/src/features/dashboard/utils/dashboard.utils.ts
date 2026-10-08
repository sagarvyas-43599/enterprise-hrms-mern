/**
 * Shared, pure helpers for the Enterprise Dashboard widgets.
 * Keep this file free of React so it stays trivially testable.
 */

/** Standard shift length used by the backend (attendance.service.ts → 9h). */
export const STANDARD_SHIFT_MINUTES = 9 * 60;

/**
 * Backend stores attendance `date` as a UTC 'YYYY-MM-DD' string
 * (see AttendanceService.getCurrentDateString). Mirror it exactly so
 * "today" queries always line up with what the server wrote.
 */
export const getTodayISO = (): string => new Date().toISOString().split("T")[0] as string;

type PersonLike =
  | string
  | null
  | undefined
  | { _id?: string; firstName?: string; lastName?: string };

/** Extract an ObjectId from a populated-or-raw reference. */
export const getRefId = (ref: PersonLike): string | undefined => {
  if (!ref) return undefined;
  return typeof ref === "string" ? ref : ref._id;
};

export const getPersonName = (ref: PersonLike, fallback = "Unknown Employee"): string => {
  if (!ref || typeof ref === "string") return fallback;
  const name = [ref.firstName, ref.lastName].filter(Boolean).join(" ").trim();
  return name || fallback;
};

export const getInitials = (first?: string, last?: string): string =>
  `${(first?.[0] ?? "").toUpperCase()}${(last?.[0] ?? "").toUpperCase()}` || "?";

/** True when `day` (YYYY-MM-DD) falls inside the inclusive [start, end] range. */
export const isDayWithinRange = (day: string, start: string, end: string): boolean => {
  const d = day;
  const s = new Date(start).toISOString().split("T")[0] as string;
  const e = new Date(end).toISOString().split("T")[0] as string;
  return d >= s && d <= e;
};

export const formatDuration = (totalMinutes: number): string => {
  const safe = Math.max(0, Math.floor(totalMinutes));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
};

export const getGreeting = (date: Date): string => {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

/** Deterministic avatar palette so the same person always gets the same colour. */
const AVATAR_PALETTE = [
  "from-indigo-500 to-violet-500",
  "from-sky-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-fuchsia-500 to-purple-500",
];

export const getAvatarGradient = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length] as string;
};

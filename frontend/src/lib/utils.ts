import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standard enterprise Tailwind CSS class merging utility
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format ISO date string into readable enterprise date format (e.g. 15 Oct, 2026)
 */
export function formatDate(dateString?: string | Date): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format ISO date to 12-hour AM/PM time
 */
export function formatTime(dateString?: string | Date): string {
  if (!dateString) return "--:--";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date/Time formatting utilities for Asia/Kolkata timezone with 12-hour format
// Backend stores dates in IST, so we format without timezone conversion

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  return `${hours}:${minutes} ${ampm}`;
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)}, ${formatTime(date)}`;
}

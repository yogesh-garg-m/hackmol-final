import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isAfter, isBefore, isToday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  return format(date, "EEE, MMM d, yyyy • h:mm a");
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return format(date, "MMM d, yyyy");
}

export function isEventOngoing(dateString: string): boolean {
  const eventDate = new Date(dateString);
  const now = new Date();
  
  // Consider an event ongoing if it's today
  return isToday(eventDate);
}

export function isEventPast(dateString: string): boolean {
  const eventDate = new Date(dateString);
  const now = new Date();
  
  return isBefore(eventDate, now) && !isToday(eventDate);
}

export function isEventUpcoming(dateString: string): boolean {
  const eventDate = new Date(dateString);
  const now = new Date();
  
  return isAfter(eventDate, now);
}

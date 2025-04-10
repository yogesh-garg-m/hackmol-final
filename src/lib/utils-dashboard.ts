import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, differenceInDays, isToday, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date in a friendly way
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, "h:mm a")}`;
  } else if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, "h:mm a")}`;
  } else if (differenceInDays(new Date(), dateObj) < 7) {
    return format(dateObj, "EEEE 'at' h:mm a");
  } else {
    return format(dateObj, "MMM d, yyyy 'at' h:mm a");
  }
}

// Format date for the calendar
export function formatCalendarDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "yyyy-MM-dd");
}

// Generate status badge classes
export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "Pending":
      return "badge-pending";
    case "Active":
      return "badge-active";
    case "Open":
      return "badge-active";
    case "Cancelled":
      return "badge-cancelled";
    case "Closing Soon":
      return "badge-closing-soon";
    case "Waitlisted":
      return "badge-waitlisted";
    case "Closed":
      return "badge-closed";
    default:
      return "badge-pending";
  }
}

// Generate category badge classes
export function getCategoryBadgeClass(category: string): string {
  switch (category) {
    case "Technical":
      return "badge-technical";
    case "Cultural":
      return "badge-cultural";
    case "Sports":
      return "badge-sports";
    case "Services":
      return "badge-services";
    case "Academic":
      return "badge-academic";
    default:
      return "badge-technical";
  }
}

// Format numbers with suffixes like k, M
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  } else {
    return num.toString();
  }
}

// Calculate percentage change
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// Get trend direction
export function getTrendDirection(value: number): "up" | "down" | "neutral" {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "neutral";
}

// Generate color for charts
export const chartColors = [
  "#4361ee", // blue
  "#3a0ca3", // indigo
  "#7209b7", // purple
  "#f72585", // pink
  "#4cc9f0", // green
  "#ffb703", // yellow
  "#e63946", // red
  "#fb8500", // orange
  "#2ec4b6", // teal
];

// Get chart color by index
export function getChartColor(index: number): string {
  return chartColors[index % chartColors.length];
}

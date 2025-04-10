import { format, formatDistanceToNow, isAfter } from "date-fns";

export const formatEventDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, "EEEE, MMMM do, yyyy 'at' h:mm a");
};

export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  if (isAfter(date, now)) {
    return `${formatDistanceToNow(date)} from now`;
  } else {
    return `${formatDistanceToNow(date)} ago`;
  }
};

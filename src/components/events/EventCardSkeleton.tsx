import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface EventCardSkeletonProps {
  viewMode: "grid" | "list";
  isMobileView: boolean;
}

const EventCardSkeleton = ({
  viewMode,
  isMobileView,
}: EventCardSkeletonProps) => {
  if (viewMode === "grid" && !isMobileView) {
    return (
      <Card className="overflow-hidden h-full flex flex-col animate-pulse">
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700" />
        <CardContent className="flex-grow p-4 space-y-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded flex-grow" />
          <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden flex animate-pulse">
      <div className="relative h-auto w-32 sm:w-48 bg-gray-200 dark:bg-gray-700" />
      <div className="flex flex-col flex-grow p-4 gap-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="flex gap-2 mt-auto">
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded flex-grow" />
          <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </Card>
  );
};

export default EventCardSkeleton;

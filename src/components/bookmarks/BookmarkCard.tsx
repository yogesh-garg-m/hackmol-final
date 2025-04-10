import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface Bookmark {
  id: number;
  title: string;
  description: string;
  date: string;
}

interface BookmarkCardProps {
  bookmark: Bookmark;
}

const BookmarkCard = ({ bookmark }: BookmarkCardProps) => {
  return (
    <Card className="p-4 hover:shadow-md transition-all duration-300 group">
      <h4 className="font-medium group-hover:text-primary transition-colors">
        {bookmark.title}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
        {bookmark.description}
      </p>
      <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
        <Calendar className="h-3.5 w-3.5" />
        <span>{bookmark.date}</span>
      </div>
    </Card>
  );
};

export default BookmarkCard;

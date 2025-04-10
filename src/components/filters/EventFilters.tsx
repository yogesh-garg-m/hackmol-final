import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SlidersHorizontal, Tags } from "lucide-react";

interface Category {
  id: string;
  label: string;
  isPreference: boolean;
}

interface EventFiltersProps {
  categories: Category[];
  onFilterChange: (filters: {
    categories: string[];
    timeRange: number | null;
    showPreferencesFirst: boolean;
  }) => void;
  isMobileView: boolean;
  hasUserPreferences: boolean;
}

const EventFilters = ({
  categories,
  onFilterChange,
  isMobileView,
  hasUserPreferences,
}: EventFiltersProps) => {
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    categories.map((c) => c.id)
  );
  const [timeRange, setTimeRange] = React.useState<number | null>(null);
  const [showPreferencesFirst, setShowPreferencesFirst] =
    React.useState(hasUserPreferences);

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(newCategories);
    onFilterChange({
      categories: newCategories,
      timeRange,
      showPreferencesFirst,
    });
  };

  const handleToggleAll = () => {
    const newCategories = selectedCategories.length === categories.length
      ? []
      : categories.map((c) => c.id);
    setSelectedCategories(newCategories);
    onFilterChange({
      categories: newCategories,
      timeRange,
      showPreferencesFirst,
    });
  };

  const handleTimeRangeSelect = (hours: number | null) => {
    setTimeRange(hours);
    onFilterChange({
      categories: selectedCategories,
      timeRange: hours,
      showPreferencesFirst,
    });
  };

  const handlePreferencesToggle = (checked: boolean) => {
    setShowPreferencesFirst(checked);
    onFilterChange({
      categories: selectedCategories,
      timeRange,
      showPreferencesFirst: checked,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <div className="p-2">
            {hasUserPreferences && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Show Preferences First
                </span>
                <Switch
                  checked={showPreferencesFirst}
                  onCheckedChange={handlePreferencesToggle}
                />
              </div>
            )}
            <div className="space-y-1">
              <DropdownMenuItem onClick={() => handleTimeRangeSelect(24)}>
                Next 24 Hours
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTimeRangeSelect(168)}>
                Next Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTimeRangeSelect(720)}>
                Next Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTimeRangeSelect(null)}>
                All Time
              </DropdownMenuItem>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Tags className="h-4 w-4" />
            Tags
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Categories</span>
            <Button
              variant={selectedCategories.length === categories.length ? "default" : "outline"}
              size="sm"
              onClick={handleToggleAll}
              className="h-7 px-2"
            >
              {selectedCategories.length === categories.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  category.isPreference ? "border-primary" : ""
                }`}
                onClick={() => handleCategoryToggle(category.id)}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default EventFilters;

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { EventFilter } from "@/types/event";

interface EventFiltersProps {
  filters: EventFilter;
  setFilters: React.Dispatch<React.SetStateAction<EventFilter>>;
}

const EventFilters = ({ filters, setFilters }: EventFiltersProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search for volunteer events..."
            className="pl-10 border-volunteer-light focus-visible:ring-volunteer-DEFAULT"
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="emergency-mode"
            checked={filters.showEmergencyOnly}
            onCheckedChange={(checked) => 
              setFilters({ ...filters, showEmergencyOnly: checked })
            }
            className="data-[state=checked]:bg-volunteer-emergency"
          />
          <Label 
            htmlFor="emergency-mode" 
            className="text-sm font-medium text-volunteer-text cursor-pointer"
          >
            Show Urgent Needs Only
          </Label>
        </div>
      </div>
    </div>
  );
};

export default EventFilters;

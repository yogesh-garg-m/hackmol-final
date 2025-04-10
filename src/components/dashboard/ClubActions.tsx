import { Button } from "@/components/ui/button";
import { Check, Ban } from "lucide-react";
import type { Club } from "@/lib/mock-data";

interface ClubActionsProps {
  club: Club;
  onApprove: () => void;
  onBan: () => void;
}

const ClubActions = ({ club, onApprove, onBan }: ClubActionsProps) => {
  if (club.status === "Pending") {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300"
          onClick={onBan}
        >
          <Ban className="h-4 w-4 mr-1" />
          Reject
        </Button>
        <Button
          size="sm"
          className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100 hover:border-green-300"
          onClick={onApprove}
        >
          <Check className="h-4 w-4 mr-1" />
          Approve
        </Button>
      </div>
    );
  }

  if (club.status === "Approved") {
    return (
      <Button
        variant="outline"
        size="sm"
        className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300"
        onClick={onBan}
      >
        <Ban className="h-4 w-4 mr-1" />
        Ban
      </Button>
    );
  }

  if (club.status === "Banned") {
    return (
      <Button
        size="sm"
        className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100 hover:border-green-300"
        onClick={onApprove}
      >
        <Check className="h-4 w-4 mr-1" />
        Activate
      </Button>
    );
  }

  return null;
};

export default ClubActions;
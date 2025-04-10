import { Card } from "@/components/ui/card";
import { AlertTriangle, Clock } from "lucide-react";

interface Alert {
  id: number;
  title: string;
  message: string;
  type: "deadline" | "emergency";
  countdown: string;
}

interface AlertCardProps {
  alert: Alert;
}

const AlertCard = ({ alert }: AlertCardProps) => {
  return (
    <Card
      className={`
        p-3 flex items-start gap-3 group hover:shadow-md transition-all duration-300
        ${
          alert.type === "deadline"
            ? "bg-amber-50 dark:bg-amber-950"
            : "bg-red-50 dark:bg-red-950"
        }
      `}
    >
      <AlertTriangle
        className={`
          h-5 w-5 flex-shrink-0 mt-0.5
          ${alert.type === "deadline" ? "text-amber-500" : "text-red-500"}
        `}
      />
      <div className="flex-grow">
        <h4 className="font-medium text-sm">{alert.title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {alert.message}
        </p>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
          <Clock className="h-3.5 w-3.5" />
          <span>{alert.countdown}</span>
        </div>
      </div>
    </Card>
  );
};

export default AlertCard;

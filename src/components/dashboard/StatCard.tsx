import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { formatNumber, getTrendDirection } from "@/lib/utils-dashboard";

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  icon?: React.ReactNode;
  loading?: boolean;
}

const StatCard = ({ title, value, change = 0, icon, loading = false }: StatCardProps) => {
  const trendDirection = getTrendDirection(change);

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex justify-between items-start mb-2">
        <h3 className="stat-label">{title}</h3>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      {loading ? (
        <div className="h-9 w-24 animate-pulse bg-muted rounded"></div>
      ) : (
        <div className="stat-value">{formatNumber(value)}</div>
      )}
      {change !== 0 && (
        <div
          className={`mt-2 text-sm flex items-center ${
            trendDirection === "up" ? "text-green-600" : trendDirection === "down" ? "text-red-600" : "text-muted-foreground"
          }`}
        >
          {trendDirection === "up" ? (
            <ArrowUpIcon className="h-4 w-4 mr-1" />
          ) : trendDirection === "down" ? (
            <ArrowDownIcon className="h-4 w-4 mr-1" />
          ) : null}
          <span>
            {Math.abs(change)}% {trendDirection === "up" ? "increase" : trendDirection === "down" ? "decrease" : ""}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
import { getStatusBadgeClass } from "@/lib/utils-dashboard";

interface BadgeStatusProps {
  status: string;
}

const BadgeStatus = ({ status }: BadgeStatusProps) => {
  const className = getStatusBadgeClass(status);

  return <span className={`badge ${className}`}>{status}</span>;
};

export default BadgeStatus;

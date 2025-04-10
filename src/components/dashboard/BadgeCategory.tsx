import { getCategoryBadgeClass } from "@/lib/utils-dashboard";

interface BadgeCategoryProps {
  category: string;
}

const BadgeCategory = ({ category }: BadgeCategoryProps) => {
  const className = getCategoryBadgeClass(category);

  return <span className={`badge ${className}`}>{category}</span>;
};

export default BadgeCategory;
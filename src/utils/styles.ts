export const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case "technical":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "workshop":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "cultural":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "networking":
      return "bg-green-100 text-green-800 border-green-200";
    case "sports":
      return "bg-red-100 text-red-800 border-red-200";
    case "academic":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "music":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "dance":
      return "bg-pink-100 text-pink-800 border-pink-200";
    case "arts":
      return "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200";
    case "finance":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "coding":
      return "bg-violet-100 text-violet-800 border-violet-200";
    case "entrepreneurship":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "environment":
      return "bg-teal-100 text-teal-800 border-teal-200";
    case "gaming":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "literature":
      return "bg-slate-100 text-slate-800 border-slate-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

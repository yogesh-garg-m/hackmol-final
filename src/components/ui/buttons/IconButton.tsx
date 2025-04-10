import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const IconButton = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button> & {
    icon: React.ElementType;
    badge?: number;
    className?: string;
  }
>(({ icon: Icon, badge, className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={`relative hover:bg-primary/10 transition-colors duration-300 ${
        className || ""
      }`}
      {...props}
    >
      <Icon className="h-5 w-5 transition-transform hover:scale-110 duration-200" />
      {typeof badge === "number" && (
        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
          {badge}
        </Badge>
      )}
    </Button>
  );
});
IconButton.displayName = "IconButton";

export default IconButton;

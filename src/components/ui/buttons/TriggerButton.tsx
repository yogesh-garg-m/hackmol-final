import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const TriggerButton = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button> & {
    icon?: React.ElementType;
    label?: string;
    showChevron?: boolean;
  }
>(
  (
    { icon: Icon, label, showChevron = true, className, children, ...props },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        size="sm"
        className={`flex items-center gap-1 hover:bg-primary/5 transition-colors ${
          className || ""
        }`}
        {...props}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {label && <span>{label}</span>}
        {children}
        {showChevron && <ChevronDown className="h-3 w-3 opacity-50" />}
      </Button>
    );
  }
);
TriggerButton.displayName = "TriggerButton";

export default TriggerButton;

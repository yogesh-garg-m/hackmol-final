import React, { forwardRef } from "react";
import { Link } from "react-router-dom";  // ✅ Use Link for routing

interface MenuItemLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;  // ✅ Allow React Router navigation
  icon?: React.ElementType;
  label?: string;
  showLabel?: boolean;
  isCenter?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

const MenuItemLink = forwardRef<HTMLAnchorElement, MenuItemLinkProps>(
  (
    { to, icon: Icon, label, showLabel, isCenter, className, onClick, ...props },
    ref
  ) => {
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (event.defaultPrevented) return; // ✅ Ensure event is valid

      if (onClick) {
        onClick(event);
        if (!event.defaultPrevented) {
          return; // ✅ Only prevent default if explicitly done
        }
      }
    };

    return to ? (
      <Link
        to={to}
        ref={ref}
        className={`
          flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md group
          ${isCenter ? "justify-center" : ""}
          ${className || ""}
        `}
        onClick={handleClick}
        {...props}
      >
        {Icon && (
          <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
        )}
        {showLabel && label && (
          <span className="group-hover:text-primary transition-colors">
            {label}
          </span>
        )}
      </Link>
    ) : (
      <a
        ref={ref}
        className={`
          flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md group
          ${isCenter ? "justify-center" : ""}
          ${className || ""}
        `}
        onClick={handleClick}
        {...props}
      >
        {Icon && (
          <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
        )}
        {showLabel && label && (
          <span className="group-hover:text-primary transition-colors">
            {label}
          </span>
        )}
      </a>
    );
  }
);

MenuItemLink.displayName = "MenuItemLink";

export default MenuItemLink;

import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, User, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/signin" || location.pathname === "/signup";

  const handleProfileClick = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      navigate("/profile");
    } else {
      navigate("/signin");
    }
  };

  const handleCreateOpening = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      navigate("/create-temporary-opening");
    } else {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create an opening",
        variant: "destructive",
      });
      navigate("/signin");
    }
  };

  return (
    <nav className="bg-white border-b fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="font-heading font-bold text-lg">Campus SETU</span>
        </Link>

        <div className="flex items-center gap-4">
          {!isAuthPage && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-2 hover:bg-primary/10 transition-colors"
                        >
                          <Plus className="h-4 w-4 transition-transform hover:scale-110 duration-200" />
                          <span>Create</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleCreateOpening}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Temporary Opening
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create new content</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2 hover:bg-primary/10 transition-colors"
                      onClick={handleProfileClick}
                    >
                      <User className="h-4 w-4 transition-transform hover:scale-110 duration-200" />
                      <span>
                        {location.pathname === "/" ? "Sign In" : "Profile"}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {location.pathname === "/"
                        ? "Sign in to your account"
                        : "Go to your profile"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

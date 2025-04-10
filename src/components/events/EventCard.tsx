import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Bookmark, Share2, Info, Users, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Event } from "@/types/event";
import { getCategoryColor } from "@/utils/styles";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { supabase } from "@/integrations/supabase/client";
import { RegistrationModal } from "./RegistrationModal";
import { toast } from "@/components/ui/use-toast";

interface EventCardProps {
  event: Event;
  viewMode: "grid" | "list";
  isMobileView: boolean;
  onRegister: (eventId: number) => void;
  onSave: (eventId: number) => void;
  onShare: (eventId: number) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Open":
      return "bg-primary hover:bg-primary/90";
    case "Closing Soon":
      return "bg-amber-500 hover:bg-amber-600";
    case "Waitlist":
      return "bg-purple-500 hover:bg-purple-600";
    case "Closed":
      return "bg-gray-500 hover:bg-gray-600";
    case "Cancelled":
      return "bg-red-500 hover:bg-red-600";
    case "accepted":
      return "bg-green-500 hover:bg-green-600";
    case "pending":
      return "bg-blue-500 hover:bg-blue-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};

const getButtonText = (registrationStatus: { exists: boolean; status: string } | null, eventStatus: string) => {
  if (registrationStatus?.exists) {
    if (registrationStatus.status === "accepted") {
      return "Registered";
    } else if (registrationStatus.status === "pending") {
      return "Pending";
    }
  }

  if (eventStatus === "Open" || eventStatus === "Closing Soon") {
    return "Register";
  }

  return eventStatus;
};

const isButtonDisabled = (registrationStatus: { exists: boolean; status: string } | null, eventStatus: string) => {
  if (registrationStatus?.exists) {
    return true; // Disable if user has any registration status
  }

  if (eventStatus === "Open" || eventStatus === "Closing Soon") {
    return false; // Enable for Open and Closing Soon events
  }

  return true; // Disable for all other statuses
};

const EventCard = ({
  event,
  viewMode,
  isMobileView,
  onRegister,
  onSave,
  onShare,
}: EventCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [registrationStatus, setRegistrationStatus] = useState<{
    exists: boolean;
    status: string;
  } | null>(null);

  useEffect(() => {
    checkRegistrationStatus();
  }, [event.event_id]);

  const checkRegistrationStatus = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
      if (sessionError || !sessionData?.session?.user) {
        console.error("❌ No user session found:", sessionError);
        return;
      }
  
      const userId = sessionData.session.user.id;
      
  
      const { data, error } = await supabase
        .from("event_registrations")
        .select("status")
        .eq("event_id",event.event_id) // ✅ Ensure event_id is string if UUID
        .eq("user_id", userId)
        .maybeSingle() // Ensure only one row is returned
  
      if (error) {
        console.error("❌ Detailed Supabase Error:", error);
        return;
      }

      // Check if no registration entry exists or multiple rows returned
      if (!data ) {
        setRegistrationStatus({
          exists: false,
          status: "",
        });
        return;
      } 
  
      console.log("✅ Registration Status Fetched:", data);
      setRegistrationStatus({
        exists: true,
        status: data?.status || "",
      });
    } catch (error) {
      console.error("❌ Error checking registration status:", error);
    }
  };
  
  

  const handleRegisterClick = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to register for events",
          variant: "destructive",
        });
        return;
      }
  
      const userId = session.user.id; // ✅ UUID string, don't convert
      // Fetch questions for this event
      const { data: questionsData, error: questionsError } = await supabase
        .from("event_questions")
        .select("*")
        .eq("event_id", event.event_id);
  
      if (questionsError) {
        throw questionsError;
      }
  
      setQuestions(questionsData || []);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Failed to load registration form. Please try again.",
        variant: "destructive",
      });
    }
  };
  

  const deadlineDate = new Date(event.registration_deadline);
  const timeLeft = deadlineDate.getTime() - new Date().getTime();
  const isUrgent = timeLeft < 48 * 60 * 60 * 1000; // 48 hours

  const DeadlineBadge = () => (
    <Badge
      variant="outline"
      className={`
        font-normal whitespace-nowrap px-2 min-w-[120px] text-center
        ${isUrgent ? "text-red-500 border-red-200" : ""}
      `}
    >
      Deadline: {deadlineDate.toLocaleDateString()}
    </Badge>
  );

  console.log("event type :",event.event_id ,':', event.event_type);
  if (viewMode === "grid" && !isMobileView) {
    return (
      <>
        <Card className="overflow-hidden h-full flex flex-col group hover:shadow-lg transition-all duration-300 dark:bg-gray-800">
          <div className="relative h-48 overflow-hidden">
            <img
              src={event.event_thumbnail}
              alt={event.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-0 right-0 p-2 flex flex-wrap gap-1 justify-end max-w-[80%]">
              {event.tags.map((tag, index) => (
                <Badge
                  key={index}
                  className={`
                    font-medium text-xs px-2 py-0.5
                    backdrop-blur-md bg-opacity-90
                    shadow-sm
                    transform transition-all duration-300
                    hover:scale-105 hover:shadow-md
                    ${getCategoryColor(tag)}
                  `}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            
            {/* View Details Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Link 
                to={`/event/${event.event_id}`}
                className="bg-white/90 hover:bg-white text-primary font-medium px-4 py-2 rounded-md flex items-center gap-2 transform transition-transform duration-300 hover:scale-105"
              >
                <Info className="h-4 w-4" />
                View Details
              </Link>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
              <h3 className="text-white font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                {event.name}
              </h3>
              <p className="text-white/90 text-sm mt-1">
                Organized by {event.club_name}
              </p>
            </div>
          </div>
          <CardContent className="flex-grow p-4 space-y-3">
            <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{new Date(event.datetime).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span>{new Date(event.datetime).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="flex items-start gap-1.5 text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>{event.location}</span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {event.short_description}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Eligibility: {event.eligibility}</span>
              <DeadlineBadge />
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex gap-2">
            <Button
              className={`flex-1 text-white shadow-sm hover:shadow-md transition-all duration-300 ${
                registrationStatus?.exists
                  ? getStatusColor(registrationStatus.status)
                  : getStatusColor(event.status)
              }`}
              onClick={handleRegisterClick}
              disabled={isButtonDisabled(registrationStatus, event.status)}
            >
              {getButtonText(registrationStatus, event.status)}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onSave(event.event_id)}
              className="hover:bg-primary/10 transition-colors"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onShare(event.event_id)}
              className="hover:bg-primary/10 transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <RegistrationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          eventId={event.event_id}
          eventName={event.name}
          eventType={event.event_type}
          questions={questions}
          paymentLink={event.payment_link}
        />
      </>
    );
  }

  return (
    <>
      <Card className="overflow-hidden flex group hover:shadow-lg transition-all duration-300 dark:bg-gray-800">
        <div className="relative h-auto w-32 sm:w-48 overflow-hidden">
          <img
            src={event.event_thumbnail}
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-0 right-0 p-2">
            {event.tags.map((tag, index) => (
              <Badge
                key={index}
                className={`
                  font-medium text-xs px-2 py-0.5
                  backdrop-blur-md bg-opacity-90
                  shadow-sm
                  transform transition-all duration-300
                  hover:scale-105 hover:shadow-md
                  ${getCategoryColor(tag)}
                `}
              >
                {tag}
              </Badge>
            ))}
          </div>
          
          {/* View Details Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Link 
              to={`/event/${event.event_id}`}
              className="bg-white/90 hover:bg-white text-primary text-sm font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 transform transition-transform duration-300 hover:scale-105"
            >
              <Info className="h-3 w-3" />
              Details
            </Link>
          </div>
        </div>
        <div className="flex flex-col flex-grow p-4">
          <div className="mb-3">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
              {event.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Organized by {event.club_name}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{new Date(event.datetime).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              <span>{new Date(event.datetime).toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="flex items-start gap-1.5 text-sm text-gray-600 dark:text-gray-300 mb-2">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <span>{event.location}</span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
            {event.short_description}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
            <span>Eligibility: {event.eligibility}</span>
            <DeadlineBadge />
          </div>

          <div className="flex justify-between items-center">
            <Badge variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {event.event_type}
            </Badge>

            <Button
              className={`${
                registrationStatus?.exists
                  ? getStatusColor(registrationStatus.status)
                  : getStatusColor(event.status)
              } text-white`}
              onClick={handleRegisterClick}
              disabled={isButtonDisabled(registrationStatus, event.status)}
            >
              {getButtonText(registrationStatus, event.status)}
            </Button>
          </div>
        </div>
      </Card>

      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventId={event.event_id}
        eventName={event.name}
        eventType={event.event_type}
        questions={questions}
        paymentLink={event.payment_link}
      />
    </>
  );
};

export default EventCard;

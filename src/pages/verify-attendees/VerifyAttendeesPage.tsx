import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { QrCode, Calendar, Users, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockEvents = [
  { event_id: "1", name: "Hackathon 2025", datetime: "2025-05-01T10:00:00" },
  { event_id: "2", name: "Tech Workshop", datetime: "2025-05-05T14:30:00" },
  { event_id: "3", name: "Innovation Fair", datetime: "2025-05-10T09:00:00" },
];

const mockClubName = "Code Club";

const VerifyAttendeesPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<string>("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEvent(eventId);
  };

  const goBack = () => {
    navigate("/club/dashboard");
  };

  const selectedEventDetails = mockEvents.find(
    (e) => e.event_id === selectedEvent
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-purple-950 dark:via-gray-900 dark:to-purple-900 p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <Button
          onClick={goBack}
          variant="ghost"
          className="mb-6 -ml-2 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all duration-200 group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-300 group-hover:translate-x-[-2px] transition-transform duration-200" />
          <span className="text-purple-700 dark:text-purple-300 font-medium">
            Back to Dashboard
          </span>
        </Button>

        <Card className="attendee-glassmorphic shadow-xl border-purple-200 dark:border-purple-800 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
                <QrCode className="h-8 w-8 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-purple-800 dark:text-purple-200">
              Event Verification
            </CardTitle>
            <CardDescription className="text-center text-purple-600 dark:text-purple-300">
              Verify attendees for your events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Select Event
              </label>
              <Select value={selectedEvent} onValueChange={handleSelectEvent}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-colors duration-200">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent className="attendee-dropdown-solid">
                  {mockEvents.map((event) => (
                    <SelectItem key={event.event_id} value={event.event_id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEventDetails && (
              <div className="attendee-solid rounded-lg p-4 hover:border-purple-200 dark:hover:border-purple-700 transition-all duration-200 transform hover:translate-y-[-2px]">
                <h3 className="font-medium text-purple-800 dark:text-purple-200">
                  {selectedEventDetails.name}
                </h3>
                <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                  {formatDate(selectedEventDetails.datetime)}
                </p>
              </div>
            )}

            <Button
              onClick={() =>
                toast({
                  title: "Scanning Disabled",
                  description: "This is a UI-only version.",
                })
              }
              disabled={!selectedEvent}
              className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 flex items-center justify-center gap-2 h-12 text-base transform hover:scale-105 transition-all duration-200"
            >
              <QrCode className="h-5 w-5" />
              Scan QR Code
            </Button>

            <p className="text-xs text-center text-purple-500 dark:text-purple-400">
              Select an event and scan attendee's QR ticket for verification
            </p>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-center text-sm text-purple-600 dark:text-purple-400">
          <Users className="h-4 w-4 mr-1" />
          <span>Verifying for {mockClubName}</span>
        </div>
      </div>
    </div>
  );
};

export default VerifyAttendeesPage;

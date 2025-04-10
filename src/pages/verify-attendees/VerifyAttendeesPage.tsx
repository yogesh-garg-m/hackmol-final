import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { QrCode, Calendar, Users, ArrowLeft } from 'lucide-react';
import QRScanner from '@/components/QRScanner';
import VerificationStatus from '@/components/VerificationStatus';
import { 
  fetchClubEvents, 
  getClubData, 
  checkRegistrationValidity, 
  markRegistrationAsUsed, 
  recordAttendance 
} from '@/services/mockdata';
import { useNavigate } from 'react-router-dom';

// Interfaces matching your database schema
interface Event {
  event_id: string;
  name: string;
  datetime: string;
}

interface QRData {
  club_id: string;
  event_id: string;
  user_id: string;
  is_used: boolean;
  fullname: string;
}

const VerifyAttendeesPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [isScanningEnabled, setIsScanningEnabled] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<{
    type: 'success' | 'error' | 'warning' | null;
    title: string;
    message: string;
    attendeeName?: string;
  }>({
    type: null,
    title: '',
    message: ''
  });

  useEffect(() => {
    // Retrieve club data from sessionStorage
    const { club_id } = getClubData();
    if (!club_id) {
      console.error('No club data found in sessionStorage');
      return;
    }

    // Fetch events for this club
    const loadEvents = async () => {
      const events = await fetchClubEvents(club_id);
      setEvents(events);

      // Set the first event as selected by default
      if (events.length > 0) {
        setSelectedEvent(events[0].event_id);
      }
    };

    loadEvents();
  }, []);

  const handleSelectEvent = (eventId: string) => {
    setSelectedEvent(eventId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const startScanner = () => {
    if (!selectedEvent) {
      toast({
        title: "No Event Selected",
        description: "Please select an event before scanning",
        variant: "destructive"
      });
      return;
    }
    setIsScanning(true);
    setIsScanningEnabled(true);
  };

  const handleScanSuccess = async (decodedText: string) => {
    setIsScanningEnabled(false); // Disable scanning immediately when a QR code is scanned
    try {
      console.log("\n=== Starting QR Code Verification Process ===");
      console.log("1. Received QR Code Data:", decodedText);

      // Parse the QR code data
      const qrData: QRData = JSON.parse(decodedText);
      console.log("2. Parsed QR Data:", qrData);

      // Retrieve club data from sessionStorage
      const { club_id } = getClubData();
      console.log("3. Current Club ID from Session:", club_id);
      
      if (!club_id) {
        console.log("❌ Error: No club data found in session storage");
        toast({
          title: "Club Data Missing",
          description: "Club data not found in session storage.",
          variant: "destructive"
        });
        return;
      }

      // Convert string IDs to numbers for comparison
      const qrClubId = parseInt(qrData.club_id);
      const qrEventId = parseInt(qrData.event_id);
      const currentClubId = parseInt(club_id);
      const currentEventId = parseInt(selectedEvent);

      console.log("4. Verifying Club ID Match:");
      console.log(`   - QR Code Club ID (string): ${qrData.club_id}`);
      console.log(`   - QR Code Club ID (number): ${qrClubId}`);
      console.log(`   - Current Club ID (string): ${club_id}`);
      console.log(`   - Current Club ID (number): ${currentClubId}`);
      
      if (qrClubId !== currentClubId) {
        console.log("❌ Error: Club ID mismatch");
        setVerificationStatus({
          type: 'error',
          title: 'Invalid Ticket',
          message: 'QR Ticket not valid for this Club',
          attendeeName: qrData.fullname
        });
        return;
      }
      console.log("✅ Club ID verification passed");

      // Check if the event_id matches the selected event
      console.log("\n5. Verifying Event ID Match:");
      console.log(`   - QR Code Event ID (string): ${qrData.event_id}`);
      console.log(`   - QR Code Event ID (number): ${qrEventId}`);
      console.log(`   - Selected Event ID (string): ${selectedEvent}`);
      console.log(`   - Selected Event ID (number): ${currentEventId}`);
      
      if (qrEventId !== currentEventId) {
        console.log("❌ Error: Event ID mismatch");
        setVerificationStatus({
          type: 'error',
          title: 'Invalid Ticket',
          message: 'This ticket is for a different event',
          attendeeName: qrData.fullname
        });
        return;
      }
      console.log("✅ Event ID verification passed");

      // Check if the ticket is already used
      console.log("\n6. Checking Ticket Usage Status:");
      console.log(`   - Is Ticket Used: ${qrData.is_used}`);
      
      if (qrData.is_used) {
        console.log("⚠️ Warning: Ticket already used");
        setVerificationStatus({
          type: 'warning',
          title: 'Ticket Already Used',
          message: 'This ticket has already been used',
          attendeeName: qrData.fullname
        });
        return;
      }
      console.log("✅ Ticket usage verification passed");

      // Check if the registration is valid in the database
      console.log("\n7. Verifying Registration Validity:");
      console.log(`   - Event ID: ${qrEventId}`);
      console.log(`   - User ID: ${qrData.user_id}`);
      
      const isValid = await checkRegistrationValidity(qrEventId, qrData.user_id);
      console.log("isValid", isValid);
      if (!isValid) {
        console.log("❌ Error: Invalid registration");
        setVerificationStatus({
          type: 'warning',
          title: 'Invalid Registration',
          message: 'This registration is not valid or has already been used',
          attendeeName: qrData.fullname
        });
        return;
      }
      console.log("✅ Registration validity verification passed");

      // Mark the ticket as used
      console.log("\n8. Marking Ticket as Used:");
      await markRegistrationAsUsed(qrEventId, qrData.user_id);
      console.log("✅ Ticket marked as used");

      // Record attendance
      console.log("\n9. Recording Attendance:");
      await recordAttendance(qrEventId, qrData.user_id);
      console.log("✅ Attendance recorded");

      // Show success message
      console.log("\n10. Verification Complete - Success");
      setVerificationStatus({
        type: 'success',
        title: 'Verification Successful',
        message: 'You can now attend the event',
        attendeeName: qrData.fullname
      });

      console.log("\n=== QR Code Verification Process Completed Successfully ===\n");

    } catch (error) {
      console.error('\n❌ Error in QR Code Verification Process:', error);
      setVerificationStatus({
        type: 'error',
        title: 'Unable to Verify',
        message: 'Could not read QR code data'
      });
    }
  };

  const handleScanError = (errorMessage: string) => {
    console.error('QR Scan Error:', errorMessage);
    toast({
      title: "Scanner Error",
      description: "There was an error with the QR scanner.",
      variant: "destructive"
    });
  };

  const handleCloseScanner = () => {
    setIsScanning(false);
    setIsScanningEnabled(false);
    setVerificationStatus({
      type: null,
      title: '',
      message: ''
    });
  };

  const closeStatus = () => {
    setVerificationStatus({
      type: null,
      title: '',
      message: ''
    });
    // Add a small delay before re-enabling scanning
    setTimeout(() => {
      setIsScanningEnabled(true);
    }, 100);
  };

  const goBack = () => {
    setVerificationStatus({
      type: null,
      title: '',
      message: ''
    });
    setIsScanning(false);
    setIsScanningEnabled(false);
    navigate('/club/dashboard'); // Navigate back to the club dashboard
  };

  const selectedEventDetails = events.find(e => e.event_id === selectedEvent);
  const { club_name } = getClubData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-purple-950 dark:via-gray-900 dark:to-purple-900 p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <Button
          onClick={goBack}
          variant="ghost"
          className="mb-6 -ml-2 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all duration-200 group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-300 group-hover:translate-x-[-2px] transition-transform duration-200" />
          <span className="text-purple-700 dark:text-purple-300 font-medium">Back to Dashboard</span>
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
              <Select
                value={selectedEvent}
                onValueChange={handleSelectEvent}
              >
                <SelectTrigger className="bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-colors duration-200">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent className="attendee-dropdown-solid">
                  {events.map((event) => (
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
              onClick={startScanner}
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
          <span>Verifying for {club_name}</span>
        </div>
      </div>

      {isScanning && (
        <QRScanner 
          isOpen={isScanning}
          onClose={handleCloseScanner}
          onScanSuccess={handleScanSuccess}
          onScanError={handleScanError}
          isScanningEnabled={isScanningEnabled}
        />
      )}

      <VerificationStatus 
        status={verificationStatus.type}
        title={verificationStatus.title}
        message={verificationStatus.message}
        attendeeName={verificationStatus.attendeeName}
        onClose={closeStatus}
        onGoBack={goBack}
      />
    </div>
  );
};

export default VerifyAttendeesPage  ;

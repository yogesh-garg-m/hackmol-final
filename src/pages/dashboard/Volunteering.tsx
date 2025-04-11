import { useState, useEffect } from "react";
import { HeartHandshake, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import VolunteeringDialog from "@/components/dashboard/VolunteeringDialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VolunteeringEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  emergency_flag: boolean;
  created_at: string;
}

const Volunteering = () => {
  const [volunteeringEvents, setVolunteeringEvents] = useState<VolunteeringEvent[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVolunteeringEvents();
  }, []);

  const fetchVolunteeringEvents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('volunteering_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVolunteeringEvents(data || []);
    } catch (error) {
      console.error('Error fetching volunteering events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch volunteering events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (
    title: string, 
    description: string, 
    eventDate: Date, 
    location: string, 
    emergencyFlag: boolean
  ) => {
    try {
      const { data, error } = await supabase
        .from('volunteering_events')
        .insert([
          { 
            title, 
            description, 
            event_date: eventDate.toISOString(),
            location,
            emergency_flag: emergencyFlag
          }
        ])
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        setVolunteeringEvents(prev => [data[0], ...prev]);
        toast({
          title: "Success",
          description: "Volunteering event created successfully!",
        });
      }
    } catch (error) {
      console.error('Error creating volunteering event:', error);
      toast({
        title: "Error",
        description: "Failed to create volunteering event.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('volunteering_events')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setVolunteeringEvents(prev => prev.filter(event => event.id !== id));
      toast({
        title: "Success",
        description: "Volunteering event deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting volunteering event:', error);
      toast({
        title: "Error",
        description: "Failed to delete volunteering event.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Volunteering</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Volunteering Events</CardTitle>
          <CardDescription>
            Manage and track volunteering opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    Loading events...
                  </TableCell>
                </TableRow>
              ) : volunteeringEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No volunteering events found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                volunteeringEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{event.description}</TableCell>
                    <TableCell>{format(new Date(event.event_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      {event.emergency_flag ? (
                        <Badge variant="destructive">Emergency</Badge>
                      ) : (
                        <Badge variant="secondary">Normal</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <VolunteeringDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateEvent}
      />
    </div>
  );
};

export default Volunteering;
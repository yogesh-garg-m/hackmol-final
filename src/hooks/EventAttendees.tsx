import React from 'react';
import { useEventAttendees } from '@/hooks/useEventAttendees';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const EventAttendees = () => {
  const { event_id } = useParams<{ event_id: string }>();
  const eventId = event_id ? parseInt(event_id, 10) : 0;
  const navigate = useNavigate();

  const {
    registrations,
    filteredAttendees,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    updateAttendeeStatus
  } = useEventAttendees(eventId);

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#ffcccc' }}>
        <h2 style={{ color: 'red' }}>Error Loading Attendees</h2>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const handleStatusUpdate = async (userId: string, newStatus: 'accepted' | 'pending' | 'rejected') => {
    try {
      await updateAttendeeStatus(userId, newStatus);
      toast({ title: 'Status updated' });
    } catch (err) {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const ActionButtons = ({ userId, currentStatus }: { userId: string; currentStatus: string }) => {
    if (activeTab === 'approved') {
      return (
        <div>
          <Button 
            onClick={() => handleStatusUpdate(userId, 'pending')}
            style={{ backgroundColor: 'yellow', marginRight: '5px' }}
          >
            Waitlist
          </Button>
          <Button 
            onClick={() => handleStatusUpdate(userId, 'rejected')}
            style={{ backgroundColor: 'red' }}
          >
            Reject
          </Button>
        </div>
      );
    } else {
      return (
        <div>
          <Button 
            onClick={() => handleStatusUpdate(userId, 'accepted')}
            style={{ backgroundColor: 'green', marginRight: '5px' }}
          >
            <Check /> Approve
          </Button>
          <Button 
            onClick={() => handleStatusUpdate(userId, 'rejected')}
            style={{ backgroundColor: 'red' }}
          >
            <X /> Reject
          </Button>
        </div>
      );
    }
  };

  return (
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
      <h1 style={{ color: '#333', fontSize: '24px' }}>Event Attendees</h1>
      <Button 
        onClick={() => navigate(-1)}
        style={{ backgroundColor: 'grey', marginBottom: '10px' }}
      >
        Back
      </Button>

      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as 'approved' | 'pending')}
      >
        <TabsList style={{ backgroundColor: '#ddd', padding: '5px' }}>
          <TabsTrigger value="approved" style={{ padding: '5px' }}>Approved</TabsTrigger>
          <TabsTrigger value="pending" style={{ padding: '5px' }}>Pending</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            <TabsContent value="approved">
              <table style={{ width: '100%', border: '1px solid black' }}>
                <thead>
                  <tr style={{ backgroundColor: '#ccc' }}>
                    <th>Name</th>
                    <th>Roll No</th>
                    <th>Year</th>
                    <th>Branch</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees && filteredAttendees.length > 0 ? (
                    filteredAttendees.map((attendee) => (
                      <tr key={attendee.id} style={{ borderBottom: '1px solid black' }}>
                        <td>{attendee.full_name}</td>
                        <td>{attendee.roll_no}</td>
                        <td>{attendee.year_of_study}</td>
                        <td>{attendee.branch}</td>
                        <td>
                          <ActionButtons userId={attendee.id} currentStatus={attendee.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>No approved attendees</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TabsContent>

            <TabsContent value="pending">
              <table style={{ width: '100%', border: '1px solid black' }}>
                <thead>
                  <tr style={{ backgroundColor: '#ccc' }}>
                    <th>Name</th>
                    <th>Roll No</th>
                    <th>Year</th>
                    <th>Branch</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees && filteredAttendees.length > 0 ? (
                    filteredAttendees.map((attendee) => (
                      <tr key={attendee.id} style={{ borderBottom: '1px solid black' }}>
                        <td>{attendee.full_name}</td>
                        <td>{attendee.roll_no}</td>
                        <td>{attendee.year_of_study}</td>
                        <td>{attendee.branch}</td>
                        <td>
                          <ActionButtons userId={attendee.id} currentStatus={attendee.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>No pending attendees</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default EventAttendees;
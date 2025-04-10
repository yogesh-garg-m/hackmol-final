import React from 'react';
import { useEventAttendees } from '@/hooks/useEventAttendees';
import { Check, ChevronDown, ChevronUp, ExternalLink, Eye, EyeOff, X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import AttendeeStatusChart from '@/components/AttendeeStatusChart';

// MIGRATION: This component doesn't need many changes when migrating to Supabase
// The data structure from useEventAttendees will remain the same
// but the hook implementation will change to use Supabase queries
const EventAttendees = () => {
  const { event_id } = useParams<{ event_id: string }>();
  const eventId = event_id ? parseInt(event_id, 10) : 0;
  const navigate = useNavigate();

  const {
    eventId: hookEventId,
    activeTab,
    setActiveTab,
    registrations,
    filteredAttendees,
    eventQuestions,
    isLoading,
    error,
    expandedResponses,
    toggleResponseVisibility,
    updateAttendeeStatus,
    tableScrolled,
    handleTableScroll
  } = useEventAttendees(eventId);
  
  const isMobile = useIsMobile();

  // Calculate counts for chart
  const approvedCount = registrations?.filter(a => a.status === 'accepted').length || 0;
  const pendingCount = registrations?.filter(a => a.status === 'pending').length || 0;

  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="text-destructive mb-4">
          <X size={48} />
        </div>
        <h2 className="text-2xl font-medium mb-2">Failed to load attendees</h2>
        <p className="text-muted-foreground mb-6">
          There was an error loading the event attendees. Please try again.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  // Handle status updates with optimistic UI
  const handleStatusUpdate = async (userId: string, newStatus: 'accepted' | 'pending' | 'rejected') => {
    try {
      await updateAttendeeStatus(userId, newStatus);
      
      // Show success toast
      toast({
        title: 'Status updated',
        description: `Attendee status has been updated to ${newStatus}`,
        variant: 'default',
      });
    } catch (err) {
      // Show error toast
      toast({
        title: 'Update failed',
        description: 'Failed to update attendee status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Reusable action buttons component
  const ActionButtons = ({ userId, currentStatus }: { userId: string; currentStatus: string }) => {
    if (activeTab === 'approved') {
      return (
        <div className="flex space-x-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-amber-600 border-amber-300 hover:bg-amber-50">
                Waitlist
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Move to Waitlist?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will move the attendee back to the pending list. They will need to be approved again to rejoin.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border hover:bg-secondary">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => handleStatusUpdate(userId, 'pending')}
                >
                  Move to Waitlist
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive border-red-200 hover:bg-red-50">
                Reject
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Attendee?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will completely remove the attendee from the event. This action cannot be easily undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border hover:bg-secondary">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  onClick={() => handleStatusUpdate(userId, 'rejected')}
                >
                  Reject
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    } else {
      return (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-green-600 border-green-200 hover:bg-green-50"
            onClick={() => handleStatusUpdate(userId, 'accepted')}
          >
            <Check size={16} className="mr-1" /> Approve
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive border-red-200 hover:bg-red-50">
                <X size={16} className="mr-1" /> Reject
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Applicant?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reject the applicant's registration request. This action cannot be easily undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border hover:bg-secondary">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  onClick={() => handleStatusUpdate(userId, 'rejected')}
                >
                  Reject
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    }
  };

  // Table loading skeleton
  const TableSkeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="flex space-x-4 mb-6">
        <Skeleton className="h-10 w-24 rounded" />
        <Skeleton className="h-10 w-24 rounded" />
      </div>
      
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 animate-fade-in bg-gradient-to-b from-white to-purple-50/30">
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="bg-white border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-900 transition-colors"
            >
              <ChevronLeft size={16} className="mr-1" />
              Go Back
            </Button>
            <div>
              <Badge variant="outline" className="mb-2 bg-purple-100 text-purple-800 text-sm font-normal border-purple-200">
                Event ID: {eventId}
              </Badge>
              <h1 className="text-3xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 to-violet-600">
                Event Attendees
              </h1>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground max-w-3xl">
          Manage attendee registrations for this event. Approve pending requests, view responses, or move attendees to the waitlist.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs 
            defaultValue="approved" 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'approved' | 'pending')}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-white shadow-sm p-1 border border-purple-100">
                <TabsTrigger 
                  value="approved" 
                  className="relative px-4 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=inactive]:text-muted-foreground rounded transition-all"
                >
                  Approved
                  {filteredAttendees && activeTab === 'approved' && (
                    <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200 absolute -top-2 -right-2">
                      {filteredAttendees.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="pending" 
                  className="relative px-4 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 data-[state=inactive]:text-muted-foreground rounded transition-all"
                >
                  Pending
                  {filteredAttendees && activeTab === 'pending' && (
                    <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-200 absolute -top-2 -right-2">
                      {filteredAttendees.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {isLoading ? (
              <TableSkeleton />
            ) : (
              <>
                <TabsContent value="approved" className="mt-0 animate-slide-in">
                  <div 
                    className="rounded-lg border border-purple-100 bg-white text-card-foreground shadow-sm overflow-hidden animate-table-fade"
                  >
                    <div 
                      className="relative max-h-[70vh] overflow-auto club-scrollbar" 
                      onScroll={handleTableScroll}
                    >
                      {filteredAttendees && filteredAttendees.length > 0 ? (
                        <table className="club-table w-full">
                          <thead>
                            <tr className={`club-table-header bg-purple-50 ${tableScrolled ? 'club-table-header-scrolled' : ''}`}>
                              <th className="club-table-frozen-header bg-purple-50 px-4 py-3 text-left text-sm font-medium text-purple-800">
                                Name
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-purple-800">
                                Roll No
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-purple-800">
                                Year
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-purple-800">
                                Branch
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-purple-800">
                                Profile
                              </th>
                              {eventQuestions && eventQuestions.length > 0 && (
                                <th className="px-4 py-3 text-left text-sm font-medium text-purple-800">
                                  Responses
                                </th>
                              )}
                              <th className="px-4 py-3 text-left text-sm font-medium text-purple-800">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAttendees.map((attendee, index) => (
                              <tr key={attendee.id} className={`border-t transition-colors hover:bg-purple-50/50 ${index % 2 === 0 ? 'bg-white' : 'bg-purple-50/20'}`}>
                                <td className="club-table-frozen-column bg-opacity-95 px-4 py-3 text-sm">
                                  <div className="font-medium">{attendee.full_name}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                  {attendee.roll_no}
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                  {attendee.year_of_study}
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                  {attendee.branch}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <Link 
                                    to={`/profile/${attendee.username}`}
                                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
                                  >
                                    <span>View</span>
                                    <ExternalLink size={14} className="ml-1" />
                                  </Link>
                                </td>
                                {eventQuestions && eventQuestions.length > 0 && (
                                  <td className="px-4 py-3 text-sm">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-0"
                                      onClick={() => toggleResponseVisibility(attendee.id)}
                                    >
                                      <span className="mr-1">
                                        {expandedResponses[attendee.id] ? 'Hide' : 'View'}
                                      </span>
                                      {expandedResponses[attendee.id] ? (
                                        <EyeOff size={14} />
                                      ) : (
                                        <Eye size={14} />
                                      )}
                                    </Button>
                                  </td>
                                )}
                                <td className="px-4 py-3 text-sm">
                                  <ActionButtons userId={attendee.id} currentStatus={attendee.status} />
                                </td>
                              </tr>
                            ))}
                            {filteredAttendees.map((attendee) => (
                              expandedResponses[attendee.id] && eventQuestions && (
                                <tr key={`response-${attendee.id}`} className="bg-indigo-50/40">
                                  <td colSpan={7} className="px-4 py-4 animate-fade-in">
                                    <div className="space-y-4 max-w-4xl">
                                      <h4 className="font-medium text-sm text-indigo-800">Responses from {attendee.full_name}</h4>
                                      {eventQuestions.map((question) => {
                                        const response = attendee.responses?.find(
                                          (r) => r.question_id === question.question_id
                                        );
                                        return (
                                          <div key={question.question_id} className="bg-white p-4 rounded-md shadow-sm border border-indigo-100">
                                            <p className="text-sm font-medium mb-2 text-indigo-700">
                                              {question.question}
                                            </p>
                                            {response ? (
                                              <p className="text-sm text-muted-foreground whitespace-pre-line bg-indigo-50/50 p-3 rounded-md">
                                                {response.response}
                                              </p>
                                            ) : (
                                              <p className="text-sm italic text-muted-foreground">
                                                No response provided
                                              </p>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </td>
                                </tr>
                              )
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="text-muted-foreground mb-2">
                            <Check size={48} className="mx-auto mb-4 text-purple-300" />
                          </div>
                          <h3 className="text-xl font-medium mb-1 text-purple-800">No approved attendees</h3>
                          <p className="text-muted-foreground mb-6">
                            There are no approved attendees for this event yet.
                          </p>
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveTab('pending')}
                            className="bg-transparent border-purple-200 text-purple-700 hover:bg-purple-50"
                          >
                            Check pending requests
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pending" className="mt-0 animate-slide-in">
                  <div 
                    className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50/50 text-card-foreground shadow-sm overflow-hidden animate-table-fade"
                  >
                    <div 
                      className="relative max-h-[70vh] overflow-auto club-scrollbar" 
                      onScroll={handleTableScroll}
                    >
                      {filteredAttendees && filteredAttendees.length > 0 ? (
                        <table className="club-table w-full">
                          <thead>
                            <tr className={`club-table-header bg-amber-50/80 ${tableScrolled ? 'club-table-header-scrolled' : ''}`}>
                              <th className="club-table-frozen-header bg-amber-50/80 px-4 py-3 text-left text-sm font-medium text-amber-900">
                                Name
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-amber-900">
                                Roll No
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-amber-900">
                                Year
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-amber-900">
                                Branch
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-amber-900">
                                Profile
                              </th>
                              {eventQuestions && eventQuestions.length > 0 && (
                                <th className="px-4 py-3 text-left text-sm font-medium text-amber-900">
                                  Responses
                                </th>
                              )}
                              <th className="px-4 py-3 text-left text-sm font-medium text-amber-900">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAttendees.map((attendee, index) => (
                              <tr key={attendee.id} className={`border-t border-amber-100 transition-colors hover:bg-amber-50/60 ${index % 2 === 0 ? 'bg-amber-50/30' : 'bg-amber-50/10'}`}>
                                <td className="club-table-frozen-column bg-amber-50/30 px-4 py-3 text-sm">
                                  <div className="font-medium">{attendee.full_name}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                  {attendee.roll_no}
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                  {attendee.year_of_study}
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                  {attendee.branch}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <Link 
                                    to={`/profile/${attendee.username}`}
                                    className="inline-flex items-center text-amber-700 hover:text-amber-900 transition-colors"
                                  >
                                    <span>View</span>
                                    <ExternalLink size={14} className="ml-1" />
                                  </Link>
                                </td>
                                {eventQuestions && eventQuestions.length > 0 && (
                                  <td className="px-4 py-3 text-sm">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-amber-700 hover:text-amber-900 hover:bg-amber-100 p-0"
                                      onClick={() => toggleResponseVisibility(attendee.id)}
                                    >
                                      <span className="mr-1">
                                        {expandedResponses[attendee.id] ? 'Hide' : 'View'}
                                      </span>
                                      {expandedResponses[attendee.id] ? (
                                        <EyeOff size={14} />
                                      ) : (
                                        <Eye size={14} />
                                      )}
                                    </Button>
                                  </td>
                                )}
                                <td className="px-4 py-3 text-sm">
                                  <ActionButtons userId={attendee.id} currentStatus={attendee.status} />
                                </td>
                              </tr>
                            ))}
                            {filteredAttendees.map((attendee) => (
                              expandedResponses[attendee.id] && eventQuestions && (
                                <tr key={`response-${attendee.id}`} className="bg-amber-50/70">
                                  <td colSpan={7} className="px-4 py-4 animate-fade-in">
                                    <div className="space-y-4 max-w-4xl">
                                      <h4 className="font-medium text-sm text-amber-900">Responses from {attendee.full_name}</h4>
                                      {eventQuestions.map((question) => {
                                        const response = attendee.responses?.find(
                                          (r) => r.question_id === question.question_id
                                        );
                                        return (
                                          <div key={question.question_id} className="bg-white p-4 rounded-md shadow-sm border border-amber-200">
                                            <p className="text-sm font-medium mb-2 text-amber-800">
                                              {question.question}
                                            </p>
                                            {response ? (
                                              <p className="text-sm text-muted-foreground whitespace-pre-line bg-amber-50/50 p-3 rounded-md">
                                                {response.response}
                                              </p>
                                            ) : (
                                              <p className="text-sm italic text-muted-foreground">
                                                No response provided
                                              </p>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </td>
                                </tr>
                              )
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="text-muted-foreground mb-2">
                            <Check size={48} className="mx-auto mb-4 text-amber-300" />
                          </div>
                          <h3 className="text-xl font-medium mb-1 text-amber-800">No pending requests</h3>
                          <p className="text-muted-foreground mb-6">
                            There are no pending attendee requests for this event.
                          </p>
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveTab('approved')}
                            className="bg-transparent border-amber-200 text-amber-700 hover:bg-amber-50"
                          >
                            View approved attendees
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
        
        {/* Status Chart - Right Side - Mobile responsive */}
        <div className={`${isMobile ? 'mt-6' : ''}`}>
          <AttendeeStatusChart 
            approvedCount={approvedCount}
            pendingCount={pendingCount}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default EventAttendees;
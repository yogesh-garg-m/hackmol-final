import { useState, useEffect } from "react";
import {
  SearchIcon,
  FilterIcon,
  CalendarIcon,
  PieChartIcon,
  UsersIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import BadgeStatus from "@/components/dashboard/BadgeStatus";
import BadgeCategory from "@/components/dashboard/BadgeCategory";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, getChartColor } from "@/lib/utils-dashboard";
import { useToast } from "@/components/ui/use-toast";
import { Event } from "@/types/event";

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          clubs(name),
          event_tags(tag)
        `)
        .eq("is_deleted", false)
        .order("datetime", { ascending: false });

      if (error) throw error;

      // Transform the data to match the Event type
      const transformedEvents: Event[] = data.map(event => ({
        event_id: event.event_id,
        club_id: event.club_id,
        name: event.name,
        datetime: event.datetime,
        location: event.location,
        short_description: event.short_description,
        eligibility: event.eligibility,
        registration_deadline: event.registration_deadline,
        status: event.status,
        max_attendees: event.max_attendees,
        current_attendees: event.current_attendees,
        event_thumbnail: event.event_thumbnail,
        club_name: event.clubs.name,
        tags: event.event_tags.map(tag => tag.tag),
        event_type: event.event_type,
        payment_link: event.payment_link
      }));

      setEvents(transformedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter(
    (event) =>
      (event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.club_name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "All" || event.status === statusFilter) &&
      (categoryFilter === "All" || event.event_type === categoryFilter)
  );

  const upcomingEvents = filteredEvents.filter(
    (event) => new Date(event.datetime) > new Date()
  );
  const pastEvents = filteredEvents.filter(
    (event) => new Date(event.datetime) <= new Date()
  );

  // Group events by month for chart
  const eventsCreatedByMonth = Array.from({ length: 12 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - 11 + i);
    const monthName = month.toLocaleString("default", { month: "short" });
    
    return {
      name: monthName,
      count: events.filter(event => {
        const date = new Date(event.datetime);
        return date.getMonth() === month.getMonth() && 
               date.getFullYear() === month.getFullYear();
      }).length
    };
  });

  const statusOptions = [
    "All",
    "Open",
    "Cancelled",
    "Closing Soon",
    "Waitlisted",
    "Closed",
  ];
  const categoryOptions = [
    "All",
    "Technical",
    "Cultural",
    "Sports",
    "Services",
    "Academic",
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all events across clubs
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span>Create Event</span>
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Events by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Events by Status</CardTitle>
            <CardDescription>Distribution of events by their status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {statusOptions.map((status) => {
                  const count = filteredEvents.filter(
                    (event) => event.status === status
                  ).length;
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{status}</span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Events by Category</CardTitle>
            <CardDescription>Distribution of events by category</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {categoryOptions.map((category) => {
                  const count = filteredEvents.filter(
                    (event) => event.event_type === category
                  ).length;
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events Created Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Events Created Over Time</CardTitle>
            <CardDescription>Monthly trend of new events created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isLoading ? (
                <div className="h-full w-full bg-muted animate-pulse rounded-md"></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventsCreatedByMonth}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Events Created" fill="#4361ee" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events..."
            className="w-full md:w-[280px] pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <FilterIcon className="h-4 w-4" />
                <span>Status: {statusFilter}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {statusOptions.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === statusFilter && (
                      <CheckIcon className="h-4 w-4 mr-2" />
                    )}
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                <span>Category: {categoryFilter}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {categoryOptions.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                  >
                    {category === categoryFilter && (
                      <CheckIcon className="h-4 w-4 mr-2" />
                    )}
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>Upcoming Events</span>
            {upcomingEvents.length > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {upcomingEvents.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            <span>Past Events</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                Events that are scheduled for the future
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-muted animate-pulse rounded-md"
                    ></div>
                  ))}
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="dashboard-table">
                      <thead>
                        <tr className="bg-muted/50">
                          <th>Event Name</th>
                          <th>Club</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Date & Time</th>
                          <th>Participants</th>
                          <th>Capacity</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingEvents.map((event) => (
                          <tr key={event.event_id}>
                            <td className="font-medium">{event.name}</td>
                            <td>{event.club_name}</td>
                            <td>
                              <BadgeCategory category={event.event_type} />
                            </td>
                            <td>
                              <BadgeStatus status={event.status} />
                            </td>
                            <td>{formatDate(event.datetime)}</td>
                            <td>{event.current_attendees}/{event.max_attendees}</td>
                            <td>{event.max_attendees}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500"
                                >
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No upcoming events found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Past Events</CardTitle>
              <CardDescription>Events that have already taken place</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-muted animate-pulse rounded-md"
                    ></div>
                  ))}
                </div>
              ) : pastEvents.length > 0 ? (
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="dashboard-table">
                      <thead>
                        <tr className="bg-muted/50">
                          <th>Event Name</th>
                          <th>Club</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Date & Time</th>
                          <th>Participants</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pastEvents.map((event) => (
                          <tr key={event.event_id}>
                            <td className="font-medium">{event.name}</td>
                            <td>{event.club_name}</td>
                            <td>
                              <BadgeCategory category={event.event_type} />
                            </td>
                            <td>
                              <BadgeStatus status={event.status} />
                            </td>
                            <td>{formatDate(event.datetime)}</td>
                            <td>
                              {event.current_attendees}/{event.max_attendees}
                            </td>
                            <td>
                              <Button variant="ghost" size="sm">
                                Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No past events found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Events;
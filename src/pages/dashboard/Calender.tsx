import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DayContentProps } from "react-day-picker";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, getChartColor } from "@/lib/utils-dashboard";
import BadgeStatus from "@/components/dashboard/BadgeStatus";
import BadgeCategory from "@/components/dashboard/BadgeCategory";
import type { Event } from "@/lib/mock-data";

const CalendarPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('datetime', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Events on the selected date
  const eventsOnSelectedDate = selectedDate
    ? events.filter((event) =>
        isSameDay(new Date(event.datetime), selectedDate)
      )
    : [];

  // Date with events
  const datesWithEvents = events.map((event) => new Date(event.datetime));

  // Next 7 days events
  const today = new Date();
  const nextWeekEvents = events
    .filter((event) => {
      const eventDate = new Date(event.datetime);
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays < 7 && event.status !== "Cancelled";
    })
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  // Events by day of week for chart
  const eventsByDay = [
    { name: "Sun", count: 0 },
    { name: "Mon", count: 0 },
    { name: "Tue", count: 0 },
    { name: "Wed", count: 0 },
    { name: "Thu", count: 0 },
    { name: "Fri", count: 0 },
    { name: "Sat", count: 0 },
  ];

  events.forEach((event) => {
    const dayIndex = new Date(event.datetime).getDay();
    eventsByDay[dayIndex].count++;
  });

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Event Calendar</h1>
        <p className="text-muted-foreground mt-1">
          View and manage events on a calendar
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Events by Day of Week */}
        <Card>
          <CardHeader>
            <CardTitle>Events by Day of Week</CardTitle>
            <CardDescription>Distribution of events by day of the week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isLoading ? (
                <div className="h-full w-full bg-muted animate-pulse rounded-md"></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventsByDay}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Events">
                      {eventsByDay.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getChartColor(index)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events this Week */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events This Week</CardTitle>
            <CardDescription>Next 7 days events</CardDescription>
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
            ) : nextWeekEvents.length > 0 ? (
              <div className="space-y-4">
                {nextWeekEvents.map((event) => (
                  <div
                    key={event.event_id}
                    className="p-4 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{event.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {event.club_name}
                        </p>
                      </div>
                      <BadgeStatus status={event.status} />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <BadgeCategory category={event.category} />
                      <time className="text-sm text-muted-foreground">
                        {formatDate(event.datetime)}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No upcoming events this week</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Calendar</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="font-medium">
                  {format(currentMonth, "MMMM yyyy")}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[400px] bg-muted animate-pulse rounded-md"></div>
            ) : (
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="rounded-md border"
                classNames={{
                  day_selected: "bg-primary text-primary-foreground",
                  day_today: "bg-muted text-foreground",
                }}
                components={{
                  DayContent: (props: DayContentProps) => {
                    const hasEvent = datesWithEvents.some((date) =>
                      isSameDay(date, props.date)
                    );
                    return (
                      <div className="relative flex h-9 w-9 items-center justify-center">
                        <div>{format(props.date, "d")}</div>
                        {hasEvent && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                        )}
                      </div>
                    );
                  },
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Selected Date Events */}
        <Card>
          <CardHeader>
            <CardTitle>Events on Selected Date</CardTitle>
            <CardDescription>
              {selectedDate
                ? format(selectedDate, "MMMM d, yyyy")
                : "Select a date to view events"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted animate-pulse rounded-md"
                  ></div>
                ))}
              </div>
            ) : eventsOnSelectedDate.length > 0 ? (
              <div className="space-y-4">
                {eventsOnSelectedDate.map((event) => (
                  <div
                    key={event.event_id}
                    className="p-4 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{event.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {event.club_name}
                        </p>
                      </div>
                      <BadgeStatus status={event.status} />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <BadgeCategory category={event.category} />
                      <time className="text-sm text-muted-foreground">
                        {format(new Date(event.datetime), "h:mm a")}
                      </time>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">Participants: </span>
                      <span>
                        {event.participants_count}/{event.capacity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  {selectedDate
                    ? "No events on this date"
                    : "Select a date to view events"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
          <CardDescription>
            Calendar view of events for {format(currentMonth, "MMMM yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[600px] bg-muted animate-pulse rounded-md"></div>
          ) : (
            <div className="rounded-md border p-4">
              <div className="grid grid-cols-7 gap-4 text-center mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {(() => {
                  // Create calendar grid
                  const monthStart = startOfMonth(currentMonth);
                  const monthEnd = endOfMonth(monthStart);
                  const startDate = startOfWeek(monthStart);
                  const endDate = endOfWeek(monthEnd);

                  const rows = [];
                  let days = [];
                  let day = startDate;

                  while (day <= endDate) {
                    for (let i = 0; i < 7; i++) {
                      const cloneDay = new Date(day);
                      const eventsOnDay = events.filter((event) =>
                        isSameDay(new Date(event.datetime), cloneDay)
                      );
                      
                      days.push(
                        <div
                          key={day.toString()}
                          className={`min-h-[100px] p-2 border rounded-md ${
                            !isSameMonth(day, monthStart)
                              ? "bg-muted/30 text-muted-foreground"
                              : isSameDay(day, new Date())
                              ? "bg-muted/50 border-primary"
                              : ""
                          } cursor-pointer hover:bg-muted/30 transition-colors`}
                          onClick={() => setSelectedDate(new Date(cloneDay))}
                        >
                          <div className="font-medium text-right">
                            {format(day, "d")}
                          </div>
                          <div className="mt-1 space-y-1">
                            {eventsOnDay.slice(0, 3).map((event) => (
                              <div
                                key={event.event_id}
                                className={`text-xs truncate py-1 px-1.5 rounded-sm ${
                                  event.status === "Cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : event.status === "Closed"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                                title={event.name}
                              >
                                {event.name}
                              </div>
                            ))}
                            {eventsOnDay.length > 3 && (
                              <div className="text-xs text-muted-foreground text-center">
                                +{eventsOnDay.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                      day = addDays(day, 1);
                    }
                    rows.push(
                      <div key={day.toString()}>
                        {days}
                      </div>
                    );
                    days = [];
                  }
                  return rows;
                })()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
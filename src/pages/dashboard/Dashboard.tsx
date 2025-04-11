import { useEffect, useState } from "react";
import { Users, BookOpenCheck, Calendar, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
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
import StatCard from "@/components/dashboard/StatCard";
import BadgeStatus from "@/components/dashboard/BadgeStatus";
import BadgeCategory from "@/components/dashboard/BadgeCategory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { getChartColor, formatDate } from "@/lib/utils-dashboard";
import type { Event, Club, Profile } from "@/lib/mock-data";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [chartData, setChartData] = useState({
    userMonthlyData: [],
    eventsByStatus: [],
    clubsByCategory: [],
    yearDistribution: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Fetch clubs
      const { data: clubsData, error: clubsError } = await supabase
        .from('clubs')
        .select('*');

      if (clubsError) throw clubsError;

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      setEvents(eventsData || []);
      setClubs(clubsData || []);
      setProfiles(profilesData || []);

      // Calculate chart data
      const userMonthlyData = calculateUserMonthlyData(profilesData || []);
      const eventsByStatus = calculateEventsByStatus(eventsData || []);
      const clubsByCategory = calculateClubsByCategory(clubsData || []);
      const yearDistribution = calculateYearDistribution(profilesData || []);

      setChartData({
        userMonthlyData,
        eventsByStatus,
        clubsByCategory,
        yearDistribution,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateUserMonthlyData = (profiles: Profile[]) => {
    const monthlyData = new Map();
    profiles.forEach(profile => {
      const date = new Date(profile.created_at);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      monthlyData.set(monthYear, (monthlyData.get(monthYear) || 0) + 1);
    });

    return Array.from(monthlyData.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  };

  const calculateEventsByStatus = (events: Event[]) => {
    const statusCounts = new Map();
    events.forEach(event => {
      statusCounts.set(event.status, (statusCounts.get(event.status) || 0) + 1);
    });

    return Array.from(statusCounts.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const calculateClubsByCategory = (clubs: Club[]) => {
    const categoryCounts = new Map();
    clubs.forEach(club => {
      categoryCounts.set(club.category, (categoryCounts.get(club.category) || 0) + 1);
    });

    return Array.from(categoryCounts.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const calculateYearDistribution = (profiles: Profile[]) => {
    const yearCounts = {
      "First Year": 0,
      "Second Year": 0,
      "Third Year": 0,
      "Fourth Year": 0,
      "Fifth Year": 0
    };

    profiles.forEach(profile => {
      switch (profile.year_of_study) {
        case 1:
          yearCounts["First Year"]++;
          break;
        case 2:
          yearCounts["Second Year"]++;
          break;
        case 3:
          yearCounts["Third Year"]++;
          break;
        case 4:
          yearCounts["Fourth Year"]++;
          break;
        case 5:
          yearCounts["Fifth Year"]++;
          break;
      }
    });

    return Object.entries(yearCounts).map(([name, count]) => ({
      name,
      count,
    }));
  };

  const recentEvents = events
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const pendingClubs = clubs.filter((club) => club.status === "Pending");

  // Get counts for stats
  const totalEvents = events.length;
  const totalClubs = clubs.length;
  const totalUsers = profiles.length;
  const upcomingEvents = events.filter(
    (event) =>
      event.status !== "Cancelled" &&
      event.status !== "Closed" &&
      new Date(event.datetime) > new Date()
  ).length;

  // Calculate month-over-month changes
  const userChangePercent = 12; // TODO: Calculate actual change
  const eventChangePercent = 8; // TODO: Calculate actual change
  const clubChangePercent = 5; // TODO: Calculate actual change
  const upcomingChangePercent = -3; // TODO: Calculate actual change

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={totalUsers}
          change={userChangePercent}
          icon={<Users className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatCard
          title="Total Events"
          value={totalEvents}
          change={eventChangePercent}
          icon={<BookOpenCheck className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatCard
          title="Active Clubs"
          value={totalClubs}
          change={clubChangePercent}
          icon={<TrendingUp className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatCard
          title="Upcoming Events"
          value={upcomingEvents}
          change={upcomingChangePercent}
          icon={<Calendar className="h-5 w-5" />}
          loading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isLoading ? (
                <div className="h-full w-full bg-muted animate-pulse rounded-md"></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData.userMonthlyData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4361ee" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#4361ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#4361ee"
                      fillOpacity={1}
                      fill="url(#colorCount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Event Status Distribution</CardTitle>
            <CardDescription>Breakdown of events by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isLoading ? (
                <div className="h-full w-full bg-muted animate-pulse rounded-md"></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.eventsByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                    >
                      {chartData.eventsByStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getChartColor(index)}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Club Categories Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Club Categories</CardTitle>
            <CardDescription>Distribution of clubs by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isLoading ? (
                <div className="h-full w-full bg-muted animate-pulse rounded-md"></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.clubsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Clubs">
                      {chartData.clubsByCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getChartColor(index)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Year Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Student Year Distribution</CardTitle>
            <CardDescription>Distribution of users by year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isLoading ? (
                <div className="h-full w-full bg-muted animate-pulse rounded-md"></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData.yearDistribution}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Bar dataKey="count" name="Students" fill="#4cc9f0" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Activity & Quick Actions */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>
              Latest events created on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted animate-pulse rounded-md"
                  ></div>
                ))
              ) : (
                <>
                  {recentEvents.map((event) => (
                    <div
                      key={event.event_id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{event.name}</p>
                        <div className="flex gap-2 mt-1">
                          <BadgeCategory category={event.category} />
                          <BadgeStatus status={event.status} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(event.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>
              Clubs waiting for approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted animate-pulse rounded-md"
                  ></div>
                ))
              ) : pendingClubs.length > 0 ? (
                <>
                  {pendingClubs.map((club) => (
                    <div
                      key={club.club_id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{club.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {club.category}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(club.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No pending approvals</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
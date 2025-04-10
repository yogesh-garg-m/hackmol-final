import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface AttendeeStatusChartProps {
  approvedCount: number;
  pendingCount: number;
  isLoading?: boolean;
}

const AttendeeStatusChart: React.FC<AttendeeStatusChartProps> = ({
  approvedCount,
  pendingCount,
  isLoading = false
}) => {
  // MIGRATION: This data structure works with both mock data and Supabase data
  const data = useMemo(() => [
    { name: 'Approved', value: approvedCount, color: '#8B5CF6' }, // Purple
    { name: 'Pending', value: pendingCount, color: '#F59E0B' }    // Amber
  ], [approvedCount, pendingCount]);

  const totalAttendees = approvedCount + pendingCount;

  // Config for the chart colors
  const chartConfig = {
    approved: { 
      theme: { 
        light: '#8B5CF6',
        dark: '#9F7AFA'  // Added dark theme color
      }, 
      label: 'Approved' 
    },
    pending: { 
      theme: { 
        light: '#F59E0B',
        dark: '#FBBF24'  // Added dark theme color 
      }, 
      label: 'Pending' 
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-purple-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Attendee Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <Skeleton className="h-[180px] w-[180px] rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalAttendees === 0) {
    return (
      <Card className="bg-white shadow-sm border border-purple-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Attendee Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">No attendees registered yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-purple-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Attendee Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ChartContainer config={chartConfig}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => 
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke={entry.color}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <div className="flex flex-col">
                          <span className="font-medium" style={{ color: data.color }}>
                            {data.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {data.value} attendees
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {((data.value / totalAttendees) * 100).toFixed(1)}% of total
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ChartContainer>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-purple-500"></div>
            <span className="text-sm">Approved: {approvedCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500"></div>
            <span className="text-sm">Pending: {pendingCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendeeStatusChart;
import { useState, useEffect } from "react";
import { UserPlusIcon, SearchIcon, FilterIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils-dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Profile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  year_of_study: number;
  branch: string;
  blood_group: string;
  created_at: string;
  last_login: string;
}

const Users = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [selectedBranch, setSelectedBranch] = useState<string | "all">("all");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string | "all">("all");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    yearDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    },
    branchDistribution: {} as Record<string, number>,
    bloodGroupDistribution: {} as Record<string, number>
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const profilesData = data.map(profile => ({
        ...profile,
        year_of_study: Number(profile.year_of_study),
        created_at: new Date(profile.created_at).toLocaleDateString(),
        last_login: profile.last_login ? new Date(profile.last_login).toLocaleDateString() : 'Never'
      }));

      setProfiles(profilesData);

      // Calculate statistics
      const yearDistribution = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      };
      const branchDistribution: Record<string, number> = {};
      const bloodGroupDistribution: Record<string, number> = {};

      profilesData.forEach(profile => {
        // Count year distribution
        if (profile.year_of_study >= 1 && profile.year_of_study <= 5) {
          yearDistribution[profile.year_of_study]++;
        }

        // Count branch distribution
        branchDistribution[profile.branch] = (branchDistribution[profile.branch] || 0) + 1;

        // Count blood group distribution
        bloodGroupDistribution[profile.blood_group] = (bloodGroupDistribution[profile.blood_group] || 0) + 1;
      });

      setStats({
        totalUsers: profilesData.length,
        activeUsers: profilesData.filter(p => p.last_login !== 'Never').length,
        newUsers: profilesData.filter(p => {
          const createdDate = new Date(p.created_at);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - createdDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        }).length,
        yearDistribution,
        branchDistribution,
        bloodGroupDistribution
      });
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError('Failed to fetch user profiles');
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = 
      profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesYear = selectedYear === "all" || profile.year_of_study === selectedYear;
    const matchesBranch = selectedBranch === "all" || profile.branch === selectedBranch;
    const matchesBloodGroup = selectedBloodGroup === "all" || profile.blood_group === selectedBloodGroup;

    return matchesSearch && matchesYear && matchesBranch && matchesBloodGroup;
  });

  const yearOptions = ["All", "First Year", "Second Year", "Third Year", "Fourth Year"];
  const bloodGroupOptions = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Group users by month for chart
  const usersCreatedByMonth = Array.from({ length: 12 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - 11 + i);
    const monthName = month.toLocaleString("default", { month: "short" });
    
    return {
      name: monthName,
      count: profiles.filter(profile => {
        const date = new Date(profile.created_at);
        return date.getMonth() === month.getMonth() && 
               date.getFullYear() === month.getFullYear();
      }).length
    };
  });

  const columns = [
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "full_name",
      header: "Full Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "year_of_study",
      header: "Year",
      cell: ({ row }) => {
        const year = row.getValue("year_of_study") as number;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{year}</span>
            <span className="text-sm text-muted-foreground">year</span>
          </div>
        );
      },
    },
    {
      accessorKey: "branch",
      header: "Branch",
    },
    {
      accessorKey: "blood_group",
      header: "Blood Group",
    },
    {
      accessorKey: "created_at",
      header: "Joined",
    },
    {
      accessorKey: "last_login",
      header: "Last Login",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Analyze user demographics and registration patterns
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlusIcon className="h-4 w-4" />
          <span>Add User</span>
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Users by Year */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Year</CardTitle>
            <CardDescription>Distribution of users by academic year</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {yearOptions.map((year) => {
                  const count = filteredProfiles.filter(
                    (profile) => profile.year_of_study === Number(year)
                  ).length;
                  return (
                    <div key={year} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{year}</span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users by Blood Group */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Blood Group</CardTitle>
            <CardDescription>Distribution of users by blood group</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {bloodGroupOptions.map((group) => {
                  const count = filteredProfiles.filter(
                    (profile) => profile.blood_group === group
                  ).length;
                  return (
                    <div key={group} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{group}</span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
            </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Directory */}
      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>
            List of registered users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <SearchIcon className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 md:w-[300px] lg:w-[400px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedYear === "all" ? "all" : selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(value === "all" ? "all" : Number(value))}
              >
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue placeholder="Filter by Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {[1, 2, 3, 4, 5].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year === 1 ? "First Year" : 
                       year === 2 ? "Second Year" : 
                       year === 3 ? "Third Year" : 
                       year === 4 ? "Fourth Year" : 
                       "Fifth Year"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedBranch === "all" ? "all" : selectedBranch}
                onValueChange={(value) => setSelectedBranch(value === "all" ? "all" : value)}
              >
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue placeholder="Filter by Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {Object.keys(stats.branchDistribution).map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedBloodGroup === "all" ? "all" : selectedBloodGroup}
                onValueChange={(value) => setSelectedBloodGroup(value === "all" ? "all" : value)}
              >
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue placeholder="Filter by Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blood Groups</SelectItem>
                  {Object.keys(stats.bloodGroupDistribution).map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-muted animate-pulse rounded-md"
                ></div>
              ))}
            </div>
          ) : filteredProfiles.length > 0 ? (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="dashboard-table">
                  <thead>
                    <tr className="bg-muted/50">
                      <th>Name</th>
                      <th>Email</th>
                      <th>Year</th>
                      <th>Branch</th>
                      <th>Blood Group</th>
                      <th>Joined</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.map((profile) => (
                      <tr key={profile.id}>
                        <td>{profile.full_name}</td>
                        <td>{profile.email}</td>
                        <td>{profile.year_of_study}</td>
                        <td>{profile.branch}</td>
                        <td>{profile.blood_group}</td>
                        <td>{profile.created_at}</td>
                        <td>{profile.last_login}</td>
                        <td>
                          <Button variant="ghost" size="sm">
                            View Details
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
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
import { useState, useEffect, useMemo } from "react";
import {
  SearchIcon,
  PlusIcon,
  FileIcon,
  ArrowUpDown,
  Download,
  Ban,
  Check,
  Filter,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import BadgeCategory from "@/components/dashboard/BadgeCategory";
import BadgeStatus from "@/components/dashboard/BadgeStatus";
import ClubActions from "@/components/dashboard/ClubActions";

import { formatDate } from "@/lib/utils-dashboard";
import { toast } from "@/hooks/use-toast";
import type { Club } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";

const Clubs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchClubs = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('clubs')
        .select(`
          *,
          club_auth (
            status,
            club_code
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        // Search in clubs table by name
        query = query.ilike('name', `%${searchTerm}%`);
        
        // If we need to search by club_code, we need to do a separate query
        if (searchTerm) {
          const { data: clubAuthData } = await supabase
            .from('club_auth')
            .select('club_id')
            .ilike('club_code', `%${searchTerm}%`);
          
          if (clubAuthData && clubAuthData.length > 0) {
            const clubIds = clubAuthData.map(ca => ca.club_id);
            query = query.or(`club_id.in.(${clubIds.join(',')})`);
          }
        }
      }

      if (categoryFilter !== "All") {
        query = query.eq('category', categoryFilter);
      }

      if (statusFilter !== "All") {
        query = query.eq('club_auth.status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform the data to flatten the club_auth status and club_code
      const transformedData = data?.map(club => ({
        ...club,
        status: club.club_auth?.[0]?.status === 'Approved' ? 'Approved' : 'Pending',
        club_code: club.club_auth?.[0]?.club_code
      }));
      
      setClubs(transformedData || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch clubs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [searchTerm, categoryFilter, statusFilter]);

  // Calculate pending clubs
  const pendingClubs = useMemo(() => {
    return clubs.filter(club => club.status === "Pending");
  }, [clubs]);

  const handleApproveClub = async (clubId: string) => {
    try {
      const { error } = await supabase
        .from('club_auth')
        .update({ status: 'Approved' })
        .eq('club_id', clubId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Club approved successfully",
      });
      
      fetchClubs();
    } catch (error) {
      console.error('Error approving club:', error);
      toast({
        title: "Error",
        description: "Failed to approve club",
        variant: "destructive",
      });
    }
  };

  const handleBanClub = async (clubId: string) => {
    try {
      const { error } = await supabase
        .from('club_auth')
        .update({ status: 'Pending' })
        .eq('club_id', clubId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Club banned successfully",
      });
      
      fetchClubs();
    } catch (error) {
      console.error('Error banning club:', error);
      toast({
        title: "Error",
        description: "Failed to ban club",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedClubs = useMemo(() => {
    return [...clubs].sort((a, b) => {
      const aValue = a[sortField as keyof Club];
      const bValue = b[sortField as keyof Club];
      
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [clubs, sortField, sortDirection]);

  const paginatedClubs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedClubs.slice(start, start + pageSize);
  }, [sortedClubs, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedClubs.length / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clubs</h1>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Club
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Club Management</CardTitle>
          <CardDescription>
            Manage and monitor all clubs in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search clubs..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleCategoryFilter("All")}>
                    All Categories
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCategoryFilter("Technical")}>
                    Technical
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCategoryFilter("Cultural")}>
                    Cultural
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCategoryFilter("Sports")}>
                    Sports
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCategoryFilter("Services")}>
                    Services
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleStatusFilter("All")}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilter("Pending")}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilter("Active")}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilter("Banned")}>
                    Banned
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-2 text-left">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-1"
                      >
                        Name
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </th>
                    <th className="px-4 py-2 text-left">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("category")}
                        className="flex items-center gap-1"
                      >
                        Category
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </th>
                    <th className="px-4 py-2 text-left">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("status")}
                        className="flex items-center gap-1"
                      >
                        Status
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </th>
                    <th className="px-4 py-2 text-left">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("created_at")}
                        className="flex items-center gap-1"
                      >
                        Created At
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8">
                        <div className="flex items-center justify-center">
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                      </td>
                    </tr>
                  ) : paginatedClubs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No clubs found
                      </td>
                    </tr>
                  ) : (
                    paginatedClubs.map((club) => (
                      <tr key={club.club_id} className="border-b">
                        <td className="px-4 py-2">{club.name}</td>
                        <td className="px-4 py-2">
                          <BadgeCategory category={club.category} />
                        </td>
                        <td className="px-4 py-2">
                          <BadgeStatus status={club.status} />
                        </td>
                        <td className="px-4 py-2">
                          {formatDate(club.created_at)}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            {club.status === 'Pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveClub(club.club_id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            {club.status === 'Approved' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBanClub(club.club_id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Ban
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Showing {paginatedClubs.length} of {clubs.length} clubs
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Clubs;
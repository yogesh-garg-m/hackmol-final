import { useState, useEffect } from "react";
import { Mail, Plus, Trash2 } from "lucide-react";
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
import { format } from "date-fns";
import NewsletterDialog from "@/components/dashboard/NewsletterDialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Newsletter {
  id: string;
  heading: string;
  content: string;
  created_by: string;
  created_at: string;
}

const Newsletters = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('alert_newsletters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNewsletters(data || []);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      toast({
        title: "Error",
        description: "Failed to fetch newsletters",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewsletter = async (heading: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('alert_newsletters')
        .insert([
          { 
            heading, 
            content,
            created_by: 'Admin' // Replace with actual user ID or name
          }
        ])
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        setNewsletters(prev => [data[0], ...prev]);
        toast({
          title: "Success",
          description: "Newsletter created successfully!",
        });
      }
    } catch (error) {
      console.error('Error creating newsletter:', error);
      toast({
        title: "Error",
        description: "Failed to create newsletter.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteNewsletter = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alert_newsletters')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setNewsletters(prev => prev.filter(newsletter => newsletter.id !== id));
      toast({
        title: "Success",
        description: "Newsletter deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      toast({
        title: "Error",
        description: "Failed to delete newsletter.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Newsletters</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Newsletter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Newsletters</CardTitle>
          <CardDescription>
            Manage and send newsletters to all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Heading</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    Loading newsletters...
                  </TableCell>
                </TableRow>
              ) : newsletters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    No newsletters found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                newsletters.map((newsletter) => (
                  <TableRow key={newsletter.id}>
                    <TableCell className="font-medium">{newsletter.heading}</TableCell>
                    <TableCell className="max-w-xs truncate">{newsletter.content}</TableCell>
                    <TableCell>{newsletter.created_by}</TableCell>
                    <TableCell>{format(new Date(newsletter.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteNewsletter(newsletter.id)}
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

      <NewsletterDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onSubmit={handleCreateNewsletter} 
      />
    </div>
  );
};

export default Newsletters;
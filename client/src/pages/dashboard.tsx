import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { FolderSync, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import StatsOverview from "@/components/dashboard/stats-overview";
import QuickActions from "@/components/dashboard/quick-actions";
import EmailsTable from "@/components/dashboard/emails-table";
import BatchOperations from "@/components/dashboard/batch-operations";

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const syncEmailsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/gmail/sync', {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Gmail sync completed",
        description: `Processed ${data.processed} of ${data.total} emails`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
      queryClient.invalidateQueries({ queryKey: ['/api/emails/stats'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "FolderSync failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor your financial email processing and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Search emails, contacts..." 
                className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            {/* FolderSync Button */}
            <Button 
              onClick={() => syncEmailsMutation.mutate()}
              disabled={syncEmailsMutation.isPending}
              className="gradient-bg text-white px-6 py-2 rounded-xl font-medium shadow-modern hover:shadow-modern-lg transition-all duration-200 flex items-center space-x-2"
            >
              <FolderSync className={`h-4 w-4 ${syncEmailsMutation.isPending ? 'animate-spin' : ''}`} />
              <span>{syncEmailsMutation.isPending ? 'Syncing...' : 'FolderSync Gmail'}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="p-6 space-y-8">
        {/* Stats Overview */}
        <StatsOverview />

        {/* Quick Actions & Filters */}
        <QuickActions />

        {/* Recent Financial Emails */}
        <EmailsTable limit={10} />

        {/* Batch Operations Status */}
        <BatchOperations />
      </main>
    </div>
  );
}

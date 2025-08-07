import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import BatchOperations from "@/components/dashboard/batch-operations";
import type { BatchJob } from "@shared/schema";

export default function BulkOperations() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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

  const { data: allJobs, isLoading: jobsLoading } = useQuery<BatchJob[]>({
    queryKey: ['/api/batch-jobs'],
  });

  if (isLoading || jobsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </header>
        <main className="p-6 space-y-6">
          <Card className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-xl p-4">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-2 w-full mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Operations</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your batch processing jobs</p>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Active Operations */}
        <BatchOperations />

        {/* Recent Job History */}
        <Card className="shadow-modern border border-gray-100">
          <CardHeader>
            <CardTitle>Recent Job History</CardTitle>
          </CardHeader>
          <CardContent>
            {!allJobs || allJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No batch jobs found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Your completed and failed jobs will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {allJobs.slice(0, 10).map((job) => (
                  <div 
                    key={job.id} 
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{job.name}</h4>
                      <p className="text-sm text-gray-500">
                        {job.type.charAt(0).toUpperCase() + job.type.slice(1)} operation
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.status === 'completed' ? 'bg-green-100 text-green-800' :
                        job.status === 'failed' ? 'bg-red-100 text-red-800' :
                        job.status === 'running' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(job.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

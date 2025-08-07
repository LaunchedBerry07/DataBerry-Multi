import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tags, Download, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { BatchJob } from "@shared/schema";

export default function BatchOperations() {
  const { data: jobs, isLoading, refetch } = useQuery<BatchJob[]>({
    queryKey: ['/api/batch-jobs', { active: true }],
    refetchInterval: 3000, // Refresh every 3 seconds for real-time updates
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { variant: "outline" as const, className: "bg-yellow-100 text-yellow-700" },
      running: { variant: "default" as const, className: "bg-blue-100 text-blue-700" },
      completed: { variant: "default" as const, className: "bg-green-100 text-green-700" },
      failed: { variant: "destructive" as const, className: "bg-red-100 text-red-700" },
      cancelled: { variant: "secondary" as const, className: "bg-gray-100 text-gray-700" },
    };
    
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getJobIcon = (type: string) => {
    switch (type) {
      case 'label':
        return Tags;
      case 'export':
        return Download;
      default:
        return Tags;
    }
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    
    return past.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card className="shadow-modern border border-gray-100">
        <CardHeader>
          <CardTitle>Active Batch Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-2 w-full mb-3" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-modern border border-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Batch Operations</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="text-purple-600 hover:text-purple-700"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {!jobs || jobs.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
              <Tags className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No active batch operations</p>
            <p className="text-sm text-gray-400">Batch jobs will appear here when running</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const Icon = getJobIcon(job.type);
              const badge = getStatusBadge(job.status || 'pending');
              const progressPercentage = job.total ? Math.floor((job.progress / job.total) * 100) : 0;

              return (
                <div key={job.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <Icon className="text-white h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{job.name}</h3>
                        <p className="text-sm text-gray-500">
                          {job.type === 'export' ? 'Processing export request' : 
                           job.type === 'label' ? 'Applying labels to emails' : 
                           'Processing batch operation'}
                        </p>
                      </div>
                    </div>
                    <Badge className={badge.className}>
                      {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
                    </Badge>
                  </div>
                  
                  {job.total && job.total > 0 && (
                    <>
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="text-gray-900 font-medium">
                            {progressPercentage}% ({job.progress}/{job.total})
                          </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    </>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {job.startedAt ? 
                        `Started: ${formatTimeAgo(job.startedAt)}` : 
                        `Created: ${formatTimeAgo(job.createdAt!)}`
                      }
                    </span>
                    {job.status === 'completed' && job.result && (
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                        View Result
                      </Button>
                    )}
                    {job.status === 'running' && (
                      <span className="text-gray-500">ETA: ~2 minutes</span>
                    )}
                  </div>

                  {job.error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{job.error}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

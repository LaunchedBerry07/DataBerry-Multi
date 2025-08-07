import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  X, 
  RefreshCw, 
  Mail, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle 
} from "lucide-react";
import { BulkEmailOperationForm } from "./bulk-email-operation-form";
import { BulkContactOperationForm } from "./bulk-contact-operation-form";
import { BatchJobMonitor } from "./batch-job-monitor";
import { apiRequest } from "@/lib/queryClient";

interface BatchJob {
  id: number;
  userId: number;
  type: string;
  status: string;
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  progress: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface BatchOperationSummary {
  job: BatchJob;
  operations: any[];
  summary: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
  };
}

export function BulkOperationsDashboard({ userId }: { userId: number }) {
  const [activeJobId, setActiveJobId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: batchJobs = [], isLoading: jobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ['/api/users', userId, 'batch-jobs'],
  });

  const { data: activeJobStatus, refetch: refetchActiveJob } = useQuery({
    queryKey: ['/api/batch-jobs', activeJobId, 'status'],
    enabled: !!activeJobId,
    refetchInterval: 2000, // Poll every 2 seconds for active jobs
  });

  const cancelJobMutation = useMutation({
    mutationFn: (jobId: number) => 
      apiRequest(`/api/batch-jobs/${jobId}/cancel`, { method: 'POST' }),
    onSuccess: () => {
      refetchJobs();
      refetchActiveJob();
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'batch-jobs'] });
    },
  });

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-500",
      in_progress: "bg-blue-500",
      completed: "bg-green-500",
      failed: "bg-red-500",
      cancelled: "bg-gray-500"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      in_progress: RefreshCw,
      completed: CheckCircle2,
      failed: XCircle,
      cancelled: AlertCircle
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const formatJobType = (type: string) => {
    return type.replace('bulk_', '').replace('_', ' ').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bulk Operations</h2>
          <p className="text-muted-foreground">
            Process multiple emails and contacts efficiently with batch operations
          </p>
        </div>
        <Button onClick={() => refetchJobs()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="operations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="operations">New Operations</TabsTrigger>
          <TabsTrigger value="jobs">Job History</TabsTrigger>
          <TabsTrigger value="monitor">Live Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Bulk Email Operations
                </CardTitle>
                <CardDescription>
                  Process multiple emails at once with categorization, labeling, exporting, or deletion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BulkEmailOperationForm 
                  userId={userId} 
                  onJobCreated={(job) => {
                    setActiveJobId(job.id);
                    refetchJobs();
                  }} 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Bulk Contact Operations
                </CardTitle>
                <CardDescription>
                  Manage multiple contacts with categorization, merging, or cleanup operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BulkContactOperationForm 
                  userId={userId} 
                  onJobCreated={(job) => {
                    setActiveJobId(job.id);
                    refetchJobs();
                  }} 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Batch Jobs</CardTitle>
              <CardDescription>
                Track the status and progress of your bulk operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading jobs...</span>
                </div>
              ) : batchJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No batch jobs found. Start your first bulk operation above.
                </div>
              ) : (
                <div className="space-y-4">
                  {batchJobs.map((job: BatchJob) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => setActiveJobId(job.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(job.status)}
                          <Badge className={getStatusColor(job.status)}>
                            {job.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <div className="font-medium">{formatJobType(job.type)}</div>
                          <div className="text-sm text-muted-foreground">
                            {job.totalItems} items • {new Date(job.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {job.status === 'in_progress' && (
                          <div className="flex items-center space-x-2">
                            <Progress value={job.progress} className="w-20" />
                            <span className="text-sm text-muted-foreground">
                              {job.progress}%
                            </span>
                          </div>
                        )}
                        
                        <div className="text-right text-sm">
                          <div className="text-green-600">{job.successfulItems} successful</div>
                          {job.failedItems > 0 && (
                            <div className="text-red-600">{job.failedItems} failed</div>
                          )}
                        </div>

                        {job.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelJobMutation.mutate(job.id);
                            }}
                            disabled={cancelJobMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4">
          {activeJobId ? (
            <BatchJobMonitor 
              jobId={activeJobId} 
              jobStatus={activeJobStatus}
              onClose={() => setActiveJobId(null)}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Active Job Selected</h3>
                <p className="text-muted-foreground">
                  Select a job from the history or start a new operation to monitor its progress
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
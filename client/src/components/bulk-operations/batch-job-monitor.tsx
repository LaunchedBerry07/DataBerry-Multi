import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Activity
} from "lucide-react";

interface BatchJob {
  id: number;
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

interface BatchOperation {
  id: number;
  itemId: number;
  itemType: string;
  operation: string;
  status: string;
  result?: any;
  errorMessage?: string;
  processingTime?: number;
  createdAt: string;
  completedAt?: string;
}

interface BatchOperationSummary {
  job: BatchJob;
  operations: BatchOperation[];
  summary: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
  };
}

interface Props {
  jobId: number;
  jobStatus?: BatchOperationSummary;
  onClose: () => void;
}

export function BatchJobMonitor({ jobId, jobStatus, onClose }: Props) {
  if (!jobStatus) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Loading Job Status</h3>
          <p className="text-muted-foreground">
            Fetching details for batch job #{jobId}...
          </p>
        </CardContent>
      </Card>
    );
  }

  const { job, operations, summary } = jobStatus;

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-500",
      processing: "bg-blue-500",
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
      processing: RefreshCw,
      in_progress: RefreshCw,
      completed: CheckCircle2,
      failed: XCircle,
      cancelled: AlertTriangle
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.round((end.getTime() - start.getTime()) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  const avgProcessingTime = operations.length > 0 
    ? operations
        .filter(op => op.processingTime)
        .reduce((sum, op) => sum + (op.processingTime || 0), 0) / 
      operations.filter(op => op.processingTime).length
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(job.status)}
              Batch Job #{job.id}
            </CardTitle>
            <CardDescription>
              {job.type.replace('bulk_', '').replace('_', ' ').toUpperCase()} • 
              Created {new Date(job.createdAt).toLocaleString()}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(job.status)}>
              {job.status.toUpperCase()}
            </Badge>
            {job.startedAt && (
              <div className="text-sm text-muted-foreground">
                Duration: {formatDuration(job.startedAt, job.completedAt)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{job.processedItems} / {job.totalItems} items</span>
            </div>
            <Progress value={job.progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{job.progress}% complete</span>
              {job.status === 'in_progress' && avgProcessingTime > 0 && (
                <span>
                  ~{Math.round(avgProcessingTime)}ms per item
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950">
              <div className="text-2xl font-bold text-green-600">{job.successfulItems}</div>
              <div className="text-sm text-green-600">Successful</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950">
              <div className="text-2xl font-bold text-red-600">{job.failedItems}</div>
              <div className="text-sm text-red-600">Failed</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="text-2xl font-bold text-blue-600">
                {job.totalItems - job.processedItems}
              </div>
              <div className="text-sm text-blue-600">Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Operation Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {operations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No operations found for this job
                </div>
              ) : (
                operations.map((operation, index) => (
                  <div key={operation.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(operation.status)}
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(operation.status)}
                        >
                          {operation.status}
                        </Badge>
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {operation.itemType} #{operation.itemId}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {operation.operation}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      {operation.processingTime && (
                        <span>{operation.processingTime}ms</span>
                      )}
                      {operation.completedAt && (
                        <span>{new Date(operation.completedAt).toLocaleTimeString()}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {job.status === 'failed' && operations.some(op => op.errorMessage) && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Error Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {operations
                  .filter(op => op.errorMessage)
                  .map((operation) => (
                    <div key={operation.id} className="p-2 rounded bg-red-50 dark:bg-red-950">
                      <div className="text-sm font-medium text-red-800 dark:text-red-200">
                        {operation.itemType} #{operation.itemId}
                      </div>
                      <div className="text-xs text-red-600 dark:text-red-400">
                        {operation.errorMessage}
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
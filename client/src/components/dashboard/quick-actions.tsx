import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tags, Table, Filter, Play } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function QuickActions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createBatchJobMutation = useMutation({
    mutationFn: async (job: { type: string; name: string; parameters?: any }) => {
      return await apiRequest('/api/batch-jobs', {
        method: 'POST',
        body: JSON.stringify(job),
      });
    },
    onSuccess: () => {
      toast({
        title: "Batch job started",
        description: "Your operation is now running in the background",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/batch-jobs'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to start operation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBulkLabel = () => {
    createBatchJobMutation.mutate({
      type: 'label',
      name: 'Bulk Email Labeling',
      parameters: { category: 'receipt', labelName: 'Finance/Receipts' },
    });
  };

  const handleExportToSheets = () => {
    createBatchJobMutation.mutate({
      type: 'export',
      name: 'Export to Google Sheets',
      parameters: { format: 'sheets', category: 'all' },
    });
  };

  const handleCreateFilter = () => {
    toast({
      title: "Coming soon",
      description: "Advanced filter creation is under development",
    });
  };

  const handleRunBatch = () => {
    createBatchJobMutation.mutate({
      type: 'process',
      name: 'Email Processing Batch',
      parameters: { operation: 'categorize' },
    });
  };

  const quickActions = [
    {
      title: "Bulk Label",
      description: "Apply labels to multiple emails",
      icon: Tags,
      color: "purple",
      onClick: handleBulkLabel,
    },
    {
      title: "Export to Sheets",
      description: "Export data to Google Sheets",
      icon: Table,
      color: "cyan",
      onClick: handleExportToSheets,
    },
    {
      title: "Create Filter",
      description: "Set up automated rules",
      icon: Filter,
      color: "pink",
      onClick: handleCreateFilter,
    },
    {
      title: "Run Batch Job",
      description: "Process emails in bulk",
      icon: Play,
      color: "gray",
      onClick: handleRunBatch,
    },
  ];

  return (
    <Card className="shadow-modern border border-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quick Actions</CardTitle>
          <Select defaultValue="30">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const colorClasses = {
              purple: "border-purple-300 hover:border-purple-500 hover:bg-purple-50 text-purple-500 group-hover:text-purple-600",
              cyan: "border-cyan-300 hover:border-cyan-500 hover:bg-cyan-50 text-cyan-500 group-hover:text-cyan-600",
              pink: "border-pink-300 hover:border-pink-500 hover:bg-pink-50 text-pink-500 group-hover:text-pink-600",
              gray: "border-gray-300 hover:border-gray-500 hover:bg-gray-50 text-gray-500 group-hover:text-gray-600",
            }[action.color as keyof typeof colorClasses];

            return (
              <Button
                key={index}
                variant="outline"
                className={`p-4 h-auto rounded-xl border-2 border-dashed ${colorClasses} transition-all duration-200 text-center group flex flex-col items-center space-y-2`}
                onClick={action.onClick}
                disabled={createBatchJobMutation.isPending}
              >
                <Icon className="h-6 w-6" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{action.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

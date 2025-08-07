import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, FileText, Paperclip, Download, ExternalLink, Plus, CloudDownload, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ExportOptionsProps {
  userId: number;
  onCreateExport: () => void;
}

export default function ExportOptions({ userId, onCreateExport }: ExportOptionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: exports, isLoading } = useQuery({
    queryKey: ["/api/users", userId, "exports"],
  });

  const createExportMutation = useMutation({
    mutationFn: async (type: string) => {
      await apiRequest("POST", `/api/users/${userId}/exports`, {
        type,
        status: "pending",
        itemCount: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "exports"] });
      toast({
        title: "Export started",
        description: "Your export job has been queued for processing",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start export",
        variant: "destructive",
      });
    },
  });

  const handleExportToSheets = () => {
    createExportMutation.mutate("metadata");
  };

  const handleExportToPDF = () => {
    createExportMutation.mutate("pdf");
  };

  const handleExportAttachments = () => {
    createExportMutation.mutate("attachments");
  };

  const handleDownloadExport = (exportId: number) => {
    toast({
      title: "Download started",
      description: "Your export file is being downloaded",
    });
  };

  const handleViewInDrive = (exportId: number) => {
    toast({
      title: "Opening in Drive",
      description: "Redirecting to Google Drive",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-orange-100 text-orange-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getExportIcon = (type: string) => {
    switch (type) {
      case "metadata":
        return <FileSpreadsheet className="h-5 w-5" />;
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "attachments":
        return <Paperclip className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <FileSpreadsheet className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Email Metadata</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Export email details to Google Sheets for analysis
            </p>
            <Button
              onClick={handleExportToSheets}
              disabled={createExportMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Export to Sheets
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-8 w-8 text-red-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Email PDFs</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Convert emails to PDF files in Google Drive
            </p>
            <Button
              onClick={handleExportToPDF}
              disabled={createExportMutation.isPending}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Export PDFs
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Paperclip className="h-8 w-8 text-orange-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Attachments</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Organize attachments by category in Drive
            </p>
            <Button
              onClick={handleExportAttachments}
              disabled={createExportMutation.isPending}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Export Attachments
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Exports</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : !exports || !Array.isArray(exports) || exports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No exports created yet</p>
              <p className="text-sm text-gray-400">
                Create your first export using the options above
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Export Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.isArray(exports) && exports.map((exportJob: any) => (
                    <tr key={exportJob.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="text-gray-400 mr-2">
                            {getExportIcon(exportJob.type)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {exportJob.type === "metadata" && "Email Metadata CSV"}
                            {exportJob.type === "pdf" && "Email PDFs"}
                            {exportJob.type === "attachments" && "Email Attachments"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {exportJob.itemCount} {exportJob.type === "metadata" ? "emails" : "files"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(exportJob.status)}>
                          {exportJob.status.charAt(0).toUpperCase() + exportJob.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(exportJob.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadExport(exportJob.id)}
                            disabled={exportJob.status !== "completed"}
                            className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInDrive(exportJob.id)}
                            disabled={exportJob.status !== "completed"}
                            className="text-green-600 hover:text-green-800 disabled:text-gray-400"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

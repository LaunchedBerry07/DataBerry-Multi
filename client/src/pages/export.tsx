import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Download, FileSpreadsheet, FileText, Database, Calendar } from "lucide-react";

const exportSchema = z.object({
  format: z.enum(["sheets", "csv", "json", "pdf"]),
  category: z.enum(["all", "receipt", "bill", "statement", "confirmation", "invoice", "other"]),
  dateRange: z.enum(["7", "30", "90", "365", "all"]),
});

type ExportForm = z.infer<typeof exportSchema>;

export default function Export() {
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

  const form = useForm<ExportForm>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      format: "sheets",
      category: "all",
      dateRange: "30",
    },
  });

  const exportMutation = useMutation({
    mutationFn: async (data: ExportForm) => {
      if (data.format === "sheets") {
        return await apiRequest('/api/export/sheets', {
          method: 'POST',
          body: JSON.stringify({
            category: data.category,
            dateRange: data.dateRange,
          }),
        });
      } else {
        // For other formats, create a generic export batch job
        return await apiRequest('/api/batch-jobs', {
          method: 'POST',
          body: JSON.stringify({
            type: 'export',
            name: `Export to ${data.format.toUpperCase()}`,
            parameters: {
              format: data.format,
              category: data.category,
              dateRange: data.dateRange,
            },
          }),
        });
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Export started",
        description: "Your export job is now running in the background",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/batch-jobs'] });
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
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExportForm) => {
    exportMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const exportFormats = [
    {
      value: "sheets",
      label: "Google Sheets",
      description: "Export directly to Google Sheets for analysis",
      icon: FileSpreadsheet,
      color: "green",
    },
    {
      value: "csv",
      label: "CSV File",
      description: "Download as comma-separated values",
      icon: FileText,
      color: "blue",
    },
    {
      value: "json",
      label: "JSON File",
      description: "Export as structured JSON data",
      icon: Database,
      color: "purple",
    },
    {
      value: "pdf",
      label: "PDF Report",
      description: "Generate a formatted PDF report",
      icon: FileText,
      color: "red",
    },
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "receipt", label: "Receipts" },
    { value: "bill", label: "Bills" },
    { value: "statement", label: "Statements" },
    { value: "confirmation", label: "Confirmations" },
    { value: "invoice", label: "Invoices" },
    { value: "other", label: "Other" },
  ];

  const dateRanges = [
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 3 months" },
    { value: "365", label: "Last year" },
    { value: "all", label: "All time" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
          <p className="text-gray-600 mt-1">Export your financial email data in various formats</p>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Export Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-modern border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5 text-purple-600" />
                  <span>Export Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Format Selection */}
                    <FormField
                      control={form.control}
                      name="format"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Export Format</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {exportFormats.map((format) => {
                              const Icon = format.icon;
                              const isSelected = field.value === format.value;
                              
                              return (
                                <div
                                  key={format.value}
                                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                    isSelected
                                      ? 'border-purple-500 bg-purple-50'
                                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                                  onClick={() => field.onChange(format.value)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                      format.color === 'green' ? 'bg-green-100' :
                                      format.color === 'blue' ? 'bg-blue-100' :
                                      format.color === 'purple' ? 'bg-purple-100' :
                                      'bg-red-100'
                                    }`}>
                                      <Icon className={`h-5 w-5 ${
                                        format.color === 'green' ? 'text-green-600' :
                                        format.color === 'blue' ? 'text-blue-600' :
                                        format.color === 'purple' ? 'text-purple-600' :
                                        'text-red-600'
                                      }`} />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-medium text-gray-900">{format.label}</h3>
                                      <p className="text-sm text-gray-500">{format.description}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Category Selection */}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date Range Selection */}
                    <FormField
                      control={form.control}
                      name="dateRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date Range</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select date range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {dateRanges.map((range) => (
                                <SelectItem key={range.value} value={range.value}>
                                  {range.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={exportMutation.isPending}
                      className="w-full gradient-bg text-white h-12 text-lg font-semibold"
                    >
                      {exportMutation.isPending ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Starting Export...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Download className="h-5 w-5" />
                          <span>Start Export</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Export Info */}
          <div className="space-y-6">
            <Card className="shadow-modern border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">Export Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <FileSpreadsheet className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-purple-900">Google Sheets</p>
                    <p className="text-sm text-purple-700">Direct integration with your Google account</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-cyan-50 rounded-lg">
                  <FileText className="h-5 w-5 text-cyan-600" />
                  <div>
                    <p className="font-medium text-cyan-900">CSV & PDF</p>
                    <p className="text-sm text-cyan-700">Download files to your device</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                  <Database className="h-5 w-5 text-pink-600" />
                  <div>
                    <p className="font-medium text-pink-900">JSON Data</p>
                    <p className="text-sm text-pink-700">Structured data for developers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-modern border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Data Included</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Email sender information</li>
                  <li>• Subject lines and snippets</li>
                  <li>• Email categories and labels</li>
                  <li>• Date and time received</li>
                  <li>• Attachment information</li>
                  <li>• Processing status</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Plus, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const bulkEmailFormSchema = z.object({
  operation: z.enum(['categorize', 'label', 'export', 'delete', 'sync']),
  criteria: z.object({
    dateRange: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
    category: z.string().optional(),
    hasAttachments: z.boolean().optional(),
    fromDomains: z.array(z.string()).optional(),
    subjects: z.array(z.string()).optional(),
    labelIds: z.array(z.number()).optional(),
  }),
  actions: z.object({
    newCategory: z.string().optional(),
    newLabelId: z.number().optional(),
    exportType: z.enum(['metadata', 'pdf', 'attachments']).optional(),
    exportFormat: z.enum(['csv', 'json', 'xlsx']).optional(),
  }).optional(),
});

type BulkEmailFormData = z.infer<typeof bulkEmailFormSchema>;

interface Props {
  userId: number;
  onJobCreated?: (job: any) => void;
}

export function BulkEmailOperationForm({ userId, onJobCreated }: Props) {
  const [domainInput, setDomainInput] = useState("");
  const [subjectInput, setSubjectInput] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: labels = [] } = useQuery({
    queryKey: ['/api/users', userId, 'labels'],
  });

  const { data: templates } = useQuery({
    queryKey: ['/api/bulk/templates/emails'],
  });

  const form = useForm<BulkEmailFormData>({
    resolver: zodResolver(bulkEmailFormSchema),
    defaultValues: {
      operation: 'categorize',
      criteria: {},
      actions: {},
    },
  });

  const operation = form.watch('operation');

  const processBulkOperation = useMutation({
    mutationFn: (data: BulkEmailFormData) =>
      apiRequest(`/api/users/${userId}/bulk/emails`, {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          criteria: {
            ...data.criteria,
            fromDomains: selectedDomains.length > 0 ? selectedDomains : undefined,
            subjects: selectedSubjects.length > 0 ? selectedSubjects : undefined,
          }
        }),
      }),
    onSuccess: (job) => {
      toast({
        title: "Bulk Operation Started",
        description: `Processing ${job.totalItems} emails with ${operation} operation.`,
      });
      form.reset();
      setSelectedDomains([]);
      setSelectedSubjects([]);
      onJobCreated?.(job);
    },
    onError: (error: any) => {
      toast({
        title: "Operation Failed", 
        description: error.message || "Failed to start bulk operation",
        variant: "destructive",
      });
    },
  });

  const addDomain = () => {
    if (domainInput.trim() && !selectedDomains.includes(domainInput.trim())) {
      setSelectedDomains([...selectedDomains, domainInput.trim()]);
      setDomainInput("");
    }
  };

  const addSubject = () => {
    if (subjectInput.trim() && !selectedSubjects.includes(subjectInput.trim())) {
      setSelectedSubjects([...selectedSubjects, subjectInput.trim()]);
      setSubjectInput("");
    }
  };

  const removeDomain = (domain: string) => {
    setSelectedDomains(selectedDomains.filter(d => d !== domain));
  };

  const removeSubject = (subject: string) => {
    setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
  };

  const loadTemplate = (templateKey: string) => {
    if (!templates?.[templateKey]) return;
    
    const template = templates[templateKey];
    form.setValue("operation", template.operation);
    form.setValue("criteria", template.criteria);
    form.setValue("actions", template.actions);
    
    if (template.criteria.fromDomains) {
      setSelectedDomains(template.criteria.fromDomains);
    }
  };

  const onSubmit = (data: BulkEmailFormData) => {
    processBulkOperation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {templates && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {Object.entries(templates).map(([key, template]: [string, any]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => loadTemplate(key)}
                  className="text-xs"
                >
                  {template.operation} {template.criteria.category || 'emails'}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="operation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Operation Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select operation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="categorize">Categorize Emails</SelectItem>
                    <SelectItem value="label">Apply Label</SelectItem>
                    <SelectItem value="export">Export Data</SelectItem>
                    <SelectItem value="delete">Delete Emails</SelectItem>
                    <SelectItem value="sync">Sync with Gmail</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose what operation to perform on the selected emails
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Selection Criteria</h3>
            
            <FormField
              control={form.control}
              name="criteria.category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Any category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Any category</SelectItem>
                      <SelectItem value="receipt">Receipts</SelectItem>
                      <SelectItem value="bill">Bills</SelectItem>
                      <SelectItem value="statement">Statements</SelectItem>
                      <SelectItem value="invoice">Invoices</SelectItem>
                      <SelectItem value="confirmation">Confirmations</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="criteria.hasAttachments"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Has Attachments</FormLabel>
                    <FormDescription>
                      Only process emails that have file attachments
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>From Domains</FormLabel>
              <div className="flex space-x-2">
                <Input
                  placeholder="e.g., amazon.com"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDomain())}
                />
                <Button type="button" size="sm" onClick={addDomain}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {selectedDomains.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedDomains.map(domain => (
                    <Badge key={domain} variant="secondary" className="gap-1">
                      {domain}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeDomain(domain)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              <FormDescription>
                Filter emails from specific domains
              </FormDescription>
            </div>

            <div className="space-y-2">
              <FormLabel>Subject Keywords</FormLabel>
              <div className="flex space-x-2">
                <Input
                  placeholder="e.g., invoice, receipt"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                />
                <Button type="button" size="sm" onClick={addSubject}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {selectedSubjects.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedSubjects.map(subject => (
                    <Badge key={subject} variant="secondary" className="gap-1">
                      {subject}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSubject(subject)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              <FormDescription>
                Filter emails containing these keywords in subject
              </FormDescription>
            </div>
          </div>

          <Separator />

          {operation && operation !== 'delete' && operation !== 'sync' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Actions</h3>
              
              {operation === 'categorize' && (
                <FormField
                  control={form.control}
                  name="actions.newCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select new category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="receipt">Receipt</SelectItem>
                          <SelectItem value="bill">Bill</SelectItem>
                          <SelectItem value="statement">Statement</SelectItem>
                          <SelectItem value="invoice">Invoice</SelectItem>
                          <SelectItem value="confirmation">Confirmation</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {operation === 'label' && (
                <FormField
                  control={form.control}
                  name="actions.newLabelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apply Label</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select label" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {labels.map((label: any) => (
                            <SelectItem key={label.id} value={label.id.toString()}>
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-3 h-3 rounded" 
                                  style={{ backgroundColor: label.color }}
                                />
                                <span>{label.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {operation === 'export' && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="actions.exportType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Export Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select export type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="metadata">Email Metadata</SelectItem>
                            <SelectItem value="pdf">PDF Documents</SelectItem>
                            <SelectItem value="attachments">Attachments Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="actions.exportFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Export Format</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="xlsx">Excel</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={processBulkOperation.isPending}
          >
            {processBulkOperation.isPending ? 'Starting Operation...' : 'Start Bulk Operation'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
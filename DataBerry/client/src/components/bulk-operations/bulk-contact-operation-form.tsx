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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const bulkContactFormSchema = z.object({
  operation: z.enum(['merge', 'categorize', 'sync', 'delete']),
  criteria: z.object({
    types: z.array(z.string()).optional(),
    emailDomains: z.array(z.string()).optional(),
    lastEmailBefore: z.string().optional(),
    duplicateEmails: z.boolean().optional(),
  }),
  actions: z.object({
    newType: z.string().optional(),
    mergeIntoId: z.number().optional(),
  }).optional(),
});

type BulkContactFormData = z.infer<typeof bulkContactFormSchema>;

interface Props {
  userId: number;
  onJobCreated?: (job: any) => void;
}

export function BulkContactOperationForm({ userId, onJobCreated }: Props) {
  const [domainInput, setDomainInput] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: contacts = [] } = useQuery({
    queryKey: ['/api/users', userId, 'contacts'],
  });

  const { data: templates } = useQuery({
    queryKey: ['/api/bulk/templates/contacts'],
  });

  const form = useForm<BulkContactFormData>({
    resolver: zodResolver(bulkContactFormSchema),
    defaultValues: {
      operation: 'categorize',
      criteria: {},
      actions: {},
    },
  });

  const operation = form.watch('operation');

  const processBulkOperation = useMutation({
    mutationFn: (data: BulkContactFormData) =>
      apiRequest(`/api/users/${userId}/bulk/contacts`, {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          criteria: {
            ...data.criteria,
            types: selectedTypes.length > 0 ? selectedTypes : undefined,
            emailDomains: selectedDomains.length > 0 ? selectedDomains : undefined,
          }
        }),
      }),
    onSuccess: (job) => {
      toast({
        title: "Bulk Operation Started",
        description: `Processing ${job.totalItems} contacts with ${operation} operation.`,
      });
      form.reset();
      setSelectedDomains([]);
      setSelectedTypes([]);
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

  const removeDomain = (domain: string) => {
    setSelectedDomains(selectedDomains.filter(d => d !== domain));
  };

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const loadTemplate = (templateKey: string) => {
    if (!templates?.[templateKey]) return;
    
    const template = templates[templateKey];
    form.setValue("operation", template.operation);
    form.setValue("criteria", template.criteria);
    form.setValue("actions", template.actions);
    
    if (template.criteria.types) {
      setSelectedTypes(template.criteria.types);
    }
    if (template.criteria.emailDomains) {
      setSelectedDomains(template.criteria.emailDomains);
    }
  };

  const onSubmit = (data: BulkContactFormData) => {
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
                  {template.operation} {template.criteria.types?.[0] || 'contacts'}
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
                    <SelectItem value="categorize">Categorize Contacts</SelectItem>
                    <SelectItem value="merge">Merge Duplicates</SelectItem>
                    <SelectItem value="sync">Sync with Google</SelectItem>
                    <SelectItem value="delete">Delete Contacts</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose what operation to perform on the selected contacts
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Selection Criteria</h3>
            
            <div className="space-y-2">
              <FormLabel>Contact Types</FormLabel>
              <div className="flex flex-wrap gap-2">
                {['vendor', 'bank', 'utility', 'subscription', 'insurance', 'government'].map(type => (
                  <Badge
                    key={type}
                    variant={selectedTypes.includes(type) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleType(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
              <FormDescription>
                Select contact types to include in the operation
              </FormDescription>
            </div>

            <div className="space-y-2">
              <FormLabel>Email Domains</FormLabel>
              <div className="flex space-x-2">
                <Input
                  placeholder="e.g., bank.com"
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
                Filter contacts from specific email domains
              </FormDescription>
            </div>

            <FormField
              control={form.control}
              name="criteria.lastEmailBefore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Email Before</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Only include contacts with last email before this date
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {operation && operation !== 'delete' && operation !== 'sync' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Actions</h3>
              
              {operation === 'categorize' && (
                <FormField
                  control={form.control}
                  name="actions.newType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Contact Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select new type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vendor">Vendor</SelectItem>
                          <SelectItem value="bank">Bank</SelectItem>
                          <SelectItem value="utility">Utility</SelectItem>
                          <SelectItem value="subscription">Subscription</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                          <SelectItem value="government">Government</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {operation === 'merge' && (
                <FormField
                  control={form.control}
                  name="actions.mergeIntoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Merge Into Contact</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target contact" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contacts.map((contact: any) => (
                            <SelectItem key={contact.id} value={contact.id.toString()}>
                              {contact.name} ({contact.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        All matching contacts will be merged into this contact
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tags, Plus, Palette } from "lucide-react";

const createLabelSchema = z.object({
  name: z.string().min(1, "Label name is required"),
  color: z.string().optional(),
});

type CreateLabelForm = z.infer<typeof createLabelSchema>;

interface GmailLabel {
  id: string;
  name: string;
  messageListVisibility: string;
  labelListVisibility: string;
  color?: {
    backgroundColor?: string;
    textColor?: string;
  };
}

export default function Labels() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  const { data: labels, isLoading: labelsLoading } = useQuery<GmailLabel[]>({
    queryKey: ['/api/labels'],
  });

  const form = useForm<CreateLabelForm>({
    resolver: zodResolver(createLabelSchema),
    defaultValues: {
      name: "",
      color: "#8B5CF6",
    },
  });

  const createLabelMutation = useMutation({
    mutationFn: async (data: CreateLabelForm) => {
      return await apiRequest('/api/labels', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Label created",
        description: "Your new label has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/labels'] });
      setIsCreateDialogOpen(false);
      form.reset();
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
        title: "Failed to create label",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateLabelForm) => {
    createLabelMutation.mutate(data);
  };

  if (isLoading || labelsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </header>
        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-8 w-8 rounded mb-3" />
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-20" />
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const predefinedColors = [
    "#8B5CF6", // Purple
    "#06B6D4", // Cyan  
    "#EC4899", // Pink
    "#10B981", // Green
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#6366F1", // Indigo
    "#84CC16", // Lime
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gmail Labels</h1>
            <p className="text-gray-600 mt-1">Organize your emails with custom labels and categories</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-bg text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Label
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Label</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Label Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter label name..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-8 h-8 rounded-lg border-2 border-gray-200"
                              style={{ backgroundColor: field.value }}
                            />
                            <Input 
                              type="color" 
                              className="w-20 h-8 p-0 border-0" 
                              {...field} 
                            />
                          </div>
                          <div className="grid grid-cols-8 gap-2">
                            {predefinedColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
                                style={{ backgroundColor: color }}
                                onClick={() => field.onChange(color)}
                              />
                            ))}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center space-x-2 pt-4">
                    <Button 
                      type="submit" 
                      disabled={createLabelMutation.isPending}
                      className="gradient-bg text-white flex-1"
                    >
                      {createLabelMutation.isPending ? "Creating..." : "Create Label"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="p-6">
        {!labels || labels.length === 0 ? (
          <Card className="shadow-modern border border-gray-100">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
                <Tags className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No custom labels yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first label to start organizing your financial emails
              </p>
              <Button className="gradient-bg text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Label
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {labels.map((label) => (
              <Card 
                key={label.id} 
                className="shadow-modern hover:shadow-modern-lg transition-all duration-200 border border-gray-100"
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: label.color?.backgroundColor || "#8B5CF6",
                        color: label.color?.textColor || "#FFFFFF"
                      }}
                    >
                      <Tags className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {label.name}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Visibility</span>
                      <Badge variant="outline" className="text-xs">
                        {label.labelListVisibility === 'labelShow' ? 'Visible' : 'Hidden'}
                      </Badge>
                    </div>
                    
                    {label.name.startsWith('Finance/') && (
                      <Badge className="bg-purple-100 text-purple-700 text-xs">
                        Custom Finance Label
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

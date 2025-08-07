import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Power, Plus, Filter, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FiltersListProps {
  userId: number;
  onCreateFilter: () => void;
}

export default function FiltersList({ userId, onCreateFilter }: FiltersListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: filters, isLoading } = useQuery({
    queryKey: ["/api/users", userId, "filters"],
  });

  const deleteFilterMutation = useMutation({
    mutationFn: async (filterId: number) => {
      await apiRequest("DELETE", `/api/filters/${filterId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "filters"] });
      toast({
        title: "Filter deleted",
        description: "Email filter has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete filter",
        variant: "destructive",
      });
    },
  });

  const toggleFilterMutation = useMutation({
    mutationFn: async ({ filterId, isActive }: { filterId: number; isActive: boolean }) => {
      await apiRequest("PUT", `/api/filters/${filterId}`, { isActive: !isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "filters"] });
      toast({
        title: "Filter updated",
        description: "Filter status has been updated",
      });
    },
  });

  const handleDeleteFilter = (filterId: number) => {
    if (confirm("Are you sure you want to delete this filter?")) {
      deleteFilterMutation.mutate(filterId);
    }
  };

  const handleToggleFilter = (filterId: number, isActive: boolean) => {
    toggleFilterMutation.mutate({ filterId, isActive });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse border-0 shadow-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-xl"></div>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!filters || !Array.isArray(filters) || filters.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-cyan-50 to-pink-50 flex items-center justify-center">
          <Filter className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">No filters created yet</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Create your first email filter to automatically organize incoming emails based on sender, subject, or content.
        </p>
        <Button onClick={onCreateFilter} className="bg-cyan-gradient hover:shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Filter
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.isArray(filters) && filters.map((filter: any) => (
        <Card key={filter.id} className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-gray-900">{filter.name}</h3>
                <Badge className={filter.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                  {filter.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-600">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFilter(filter.id)}
                  className="text-gray-400 hover:text-red-600"
                  disabled={deleteFilterMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleFilter(filter.id, filter.isActive)}
                  className="text-gray-400 hover:text-orange-600"
                  disabled={toggleFilterMutation.isPending}
                >
                  <Power className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Conditions</h4>
                <div className="text-sm text-gray-500 space-y-1">
                  {filter.conditions?.from && (
                    <div>
                      • From contains: 
                      <span className="font-mono bg-gray-100 px-1 rounded ml-1">
                        {Array.isArray(filter.conditions.from) 
                          ? filter.conditions.from.join(", ") 
                          : filter.conditions.from}
                      </span>
                    </div>
                  )}
                  {filter.conditions?.subject && (
                    <div>
                      • Subject contains: 
                      <span className="font-mono bg-gray-100 px-1 rounded ml-1">
                        {Array.isArray(filter.conditions.subject) 
                          ? filter.conditions.subject.join(", ") 
                          : filter.conditions.subject}
                      </span>
                    </div>
                  )}
                  {filter.conditions?.hasAttachment && (
                    <div>• Has attachment: <span className="font-mono bg-gray-100 px-1 rounded">PDF</span></div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Actions</h4>
                <div className="text-sm text-gray-500 space-y-1">
                  {filter.actions?.labelId && (
                    <div>
                      • Apply label: 
                      <Badge className="ml-1 bg-blue-100 text-blue-800">Label</Badge>
                    </div>
                  )}
                  {filter.actions?.exportToDrive && (
                    <div>• Export to Drive: <span className="text-green-600 font-medium">Enabled</span></div>
                  )}
                  {filter.actions?.saveAttachments && (
                    <div>• Save attachments: <span className="text-green-600 font-medium">Enabled</span></div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                Matched emails: <span className="font-medium">{filter.matchCount || 0}</span>
              </span>
              <span className="text-sm text-gray-500">
                Last run: <span className="font-medium">
                  {filter.lastRun ? new Date(filter.lastRun).toRelativeTimeString() : "Never"}
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

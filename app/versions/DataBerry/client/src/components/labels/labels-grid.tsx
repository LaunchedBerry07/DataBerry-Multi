import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Tag, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LabelsGridProps {
  userId: number;
  onCreateLabel: () => void;
}

export default function LabelsGrid({ userId, onCreateLabel }: LabelsGridProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: labels, isLoading } = useQuery({
    queryKey: ["/api/users", userId, "labels"],
  });

  const deleteLabelMutation = useMutation({
    mutationFn: async (labelId: number) => {
      await apiRequest("DELETE", `/api/labels/${labelId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "labels"] });
      toast({
        title: "Label deleted",
        description: "Finance label has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete label",
        variant: "destructive",
      });
    },
  });

  const handleDeleteLabel = (labelId: number) => {
    if (confirm("Are you sure you want to delete this label?")) {
      deleteLabelMutation.mutate(labelId);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse border-0 shadow-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!labels || !Array.isArray(labels) || labels.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-purple-50 to-cyan-50 flex items-center justify-center">
          <Tag className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">No labels created yet</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Create your first finance label to start organizing your emails with custom categories and smart filtering.
        </p>
        <Button onClick={onCreateLabel} className="bg-purple-gradient hover:shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Label
        </Button>
      </div>
    );
  }

  const labelColors = [
    { bg: "from-purple-50 to-purple-100", border: "border-purple-200", icon: "from-purple-500 to-purple-600" },
    { bg: "from-cyan-50 to-cyan-100", border: "border-cyan-200", icon: "from-cyan-500 to-cyan-600" },
    { bg: "from-pink-50 to-pink-100", border: "border-pink-200", icon: "from-pink-500 to-pink-600" },
    { bg: "from-green-50 to-green-100", border: "border-green-200", icon: "from-green-500 to-green-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.isArray(labels) && labels.map((label: any, index: number) => {
        const colorConfig = labelColors[index % labelColors.length];
        return (
          <Card key={label.id} className={`border-0 shadow-modern hover:shadow-modern-lg transition-all duration-200 bg-gradient-to-r ${colorConfig.bg}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${colorConfig.icon} flex items-center justify-center`}>
                    <Tag className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{label.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Hash className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-600">{label.emailCount || 0} emails</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-lg hover:bg-white/60"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLabel(label.id)}
                    disabled={deleteLabelMutation.isPending}
                    className="h-8 w-8 p-0 rounded-lg hover:bg-white/60 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                {label.description || "No description provided for this label."}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Status: <span className="font-medium">{label.isActive ? "Active" : "Inactive"}</span>
                </div>
                <Badge className={`${label.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"} border-0`}>
                  {label.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

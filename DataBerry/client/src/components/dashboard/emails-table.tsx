import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Download, Mail, Calendar, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailsTableProps {
  userId: number;
  category?: string;
}

export default function EmailsTable({ userId, category }: EmailsTableProps) {
  const { toast } = useToast();
  
  const { data: emails, isLoading } = useQuery({
    queryKey: ["/api/users", userId, "emails", ...(category ? [{ category }] : [])],
  });

  const handleViewEmail = (emailId: string) => {
    toast({
      title: "Email Viewer",
      description: "Email viewing functionality would open here",
    });
  };

  const handleExportEmail = (emailId: string) => {
    toast({
      title: "Export Started",
      description: "Email is being exported to PDF",
    });
  };

  const handleSaveAttachments = (emailId: string) => {
    toast({
      title: "Saving Attachments",
      description: "Attachments are being saved to Drive",
    });
  };

  const getCategoryConfig = (category: string | null) => {
    switch (category) {
      case "receipt":
        return { 
          bg: "bg-gradient-to-r from-purple-50 to-purple-100", 
          text: "text-purple-800", 
          badge: "bg-purple-100 text-purple-800",
          gradient: "from-purple-500 to-purple-600"
        };
      case "bill":
        return { 
          bg: "bg-gradient-to-r from-cyan-50 to-cyan-100", 
          text: "text-cyan-800", 
          badge: "bg-cyan-100 text-cyan-800",
          gradient: "from-cyan-500 to-cyan-600"
        };
      case "statement":
        return { 
          bg: "bg-gradient-to-r from-pink-50 to-pink-100", 
          text: "text-pink-800", 
          badge: "bg-pink-100 text-pink-800",
          gradient: "from-pink-500 to-pink-600"
        };
      case "invoice":
        return { 
          bg: "bg-gradient-to-r from-purple-50 to-cyan-100", 
          text: "text-purple-800", 
          badge: "bg-gradient-to-r from-purple-100 to-cyan-100 text-purple-800",
          gradient: "from-purple-500 to-cyan-500"
        };
      default:
        return { 
          bg: "bg-gradient-to-r from-gray-50 to-gray-100", 
          text: "text-gray-800", 
          badge: "bg-gray-100 text-gray-800",
          gradient: "from-gray-500 to-gray-600"
        };
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-modern bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Financial Emails</CardTitle>
              <p className="text-sm text-gray-600">Loading your latest emails...</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return (
      <Card className="border-0 shadow-modern bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Financial Emails</CardTitle>
              <p className="text-sm text-gray-600">Your organized financial communications</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-purple-50 to-cyan-50 flex items-center justify-center">
              <Mail className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No financial emails found</h3>
            <p className="text-gray-500 mb-6">
              Connect your Gmail account and sync to see your financial emails here
            </p>
            <Button className="bg-purple-gradient hover:shadow-lg">
              <Mail className="h-4 w-4 mr-2" />
              Sync Gmail
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Financial Emails</CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
            View All <i className="fas fa-arrow-right ml-1"></i>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
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
              {Array.isArray(emails) && emails.map((email: any) => (
                <tr key={email.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {email.hasAttachments && (
                        <i className="fas fa-paperclip text-gray-400 mr-2"></i>
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {email.subject}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{email.from}</td>
                  <td className="px-6 py-4">
                    <Badge className={getCategoryConfig(email.category).badge}>
                      {email.category ? email.category.charAt(0).toUpperCase() + email.category.slice(1) : "Uncategorized"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {email.date ? new Date(email.date).toLocaleDateString() : "Unknown"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewEmail(email.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExportEmail(email.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      {email.hasAttachments && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveAttachments(email.id)}
                          className="text-orange-600 hover:text-orange-800"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

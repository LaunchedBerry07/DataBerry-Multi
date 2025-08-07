import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Tag, Download, Paperclip } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { FinancialEmail } from "@shared/schema";

interface EmailsTableProps {
  category?: string;
  limit?: number;
}

export default function EmailsTable({ category = 'all', limit = 50 }: EmailsTableProps) {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  const { data: emails, isLoading } = useQuery<FinancialEmail[]>({
    queryKey: ['/api/emails', { category, limit }],
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked && emails) {
      setSelectedEmails(emails.map(email => email.id));
    } else {
      setSelectedEmails([]);
    }
  };

  const handleSelectEmail = (emailId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmails([...selectedEmails, emailId]);
    } else {
      setSelectedEmails(selectedEmails.filter(id => id !== emailId));
    }
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      receipt: { variant: "default" as const, className: "bg-purple-100 text-purple-700" },
      bill: { variant: "secondary" as const, className: "bg-pink-100 text-pink-700" },
      statement: { variant: "outline" as const, className: "bg-cyan-100 text-cyan-700" },
      confirmation: { variant: "outline" as const, className: "bg-cyan-100 text-cyan-700" },
      invoice: { variant: "secondary" as const, className: "bg-pink-100 text-pink-700" },
      other: { variant: "outline" as const, className: "bg-gray-100 text-gray-700" },
    };
    
    return badges[category as keyof typeof badges] || badges.other;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <Card className="shadow-modern border border-gray-100">
        <CardHeader>
          <CardTitle>Recent Financial Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-modern border border-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Financial Emails</CardTitle>
          <div className="flex items-center space-x-3">
            {/* Category Filter Pills */}
            <div className="flex items-center space-x-2">
              <Badge className="bg-purple-100 text-purple-700">Receipt</Badge>
              <Badge className="bg-cyan-100 text-cyan-700">Bill</Badge>
              <Badge className="bg-pink-100 text-pink-700">Statement</Badge>
              <Badge className="bg-gray-100 text-gray-700">Other</Badge>
            </div>
            <Button variant="ghost" className="text-purple-600 hover:text-purple-700">
              View All
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-700 text-sm">
                  <Checkbox
                    checked={selectedEmails.length === emails?.length}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-4 font-medium text-gray-700 text-sm">From</th>
                <th className="text-left p-4 font-medium text-gray-700 text-sm">Subject</th>
                <th className="text-left p-4 font-medium text-gray-700 text-sm">Category</th>
                <th className="text-left p-4 font-medium text-gray-700 text-sm">Date</th>
                <th className="text-left p-4 font-medium text-gray-700 text-sm">Attachments</th>
                <th className="text-left p-4 font-medium text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {emails?.map((email) => {
                const badge = getCategoryBadge(email.category || 'other');
                const isSelected = selectedEmails.includes(email.id);
                
                return (
                  <tr key={email.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectEmail(email.id, checked as boolean)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {getInitials(email.fromName || email.fromEmail)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {email.fromName || email.fromEmail.split('@')[0]}
                          </p>
                          <p className="text-sm text-gray-500">{email.fromEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900 truncate max-w-xs">
                        {email.subject}
                      </p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {email.snippet}
                      </p>
                    </td>
                    <td className="p-4">
                      <Badge className={badge.className}>
                        {(email.category || 'other').charAt(0).toUpperCase() + 
                         (email.category || 'other').slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-900">
                        {new Date(email.dateReceived).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(email.dateReceived).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </td>
                    <td className="p-4">
                      {email.hasAttachments ? (
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {email.attachmentCount} file{email.attachmentCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No attachments</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Tag className="h-4 w-4 text-gray-400 hover:text-purple-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4 text-gray-400 hover:text-cyan-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing 1-{Math.min(limit, emails?.length || 0)} of {emails?.length || 0} emails
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">Previous</Button>
            <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

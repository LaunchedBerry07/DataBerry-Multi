import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, UserPlus, Download, Search, Users, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactsTableProps {
  userId: number;
  onSyncContacts: () => void;
}

export default function ContactsTable({ userId, onSyncContacts }: ContactsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { toast } = useToast();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["/api/users", userId, "contacts"],
  });

  const handleViewEmails = (contactId: number) => {
    toast({
      title: "Contact Emails",
      description: "Opening emails from this contact",
    });
  };

  const handleAddToGoogleContacts = (contactId: number) => {
    toast({
      title: "Adding to Google Contacts",
      description: "Contact is being added to your Google Contacts",
    });
  };

  const handleExportContactData = (contactId: number) => {
    toast({
      title: "Exporting Contact Data",
      description: "Contact data is being exported",
    });
  };

  const getContactInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case "vendor":
        return "bg-green-100 text-green-800";
      case "bank":
        return "bg-blue-100 text-blue-800";
      case "utility":
        return "bg-orange-100 text-orange-800";
      case "subscription":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredContacts = Array.isArray(contacts) ? contacts.filter((contact: any) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || contact.type === filterType;
    return matchesSearch && matchesType;
  }) : [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Financial Contacts</CardTitle>
          <Button onClick={onSyncContacts} className="bg-blue-600 hover:bg-blue-700">
            <i className="fas fa-sync mr-2"></i>
            Sync Contacts
          </Button>
        </div>
        <div className="flex items-center justify-between mt-4">
          <h3 className="text-lg font-medium text-gray-900">Extracted from Financial Emails</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="vendor">Vendors</SelectItem>
                <SelectItem value="bank">Banks</SelectItem>
                <SelectItem value="utility">Utilities</SelectItem>
                <SelectItem value="subscription">Subscriptions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!contacts || contacts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No financial contacts found</p>
            <p className="text-sm text-gray-400">
              Sync your emails to automatically extract financial contacts
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContacts.map((contact: any) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Avatar className="mr-3">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {getContactInitials(contact.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                          <div className="text-sm text-gray-500">{contact.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getContactTypeColor(contact.type)}>
                        {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{contact.emailCount || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {contact.lastEmailDate 
                        ? new Date(contact.lastEmailDate).toLocaleDateString() 
                        : "Unknown"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewEmails(contact.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddToGoogleContacts(contact.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExportContactData(contact.id)}
                          className="text-orange-600 hover:text-orange-800"
                        >
                          <Download className="h-4 w-4" />
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
  );
}

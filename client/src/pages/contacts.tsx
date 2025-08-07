import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Globe, Calendar } from "lucide-react";
import type { FinancialContact } from "@shared/schema";

export default function Contacts() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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

  const { data: contacts, isLoading: contactsLoading } = useQuery<FinancialContact[]>({
    queryKey: ['/api/contacts'],
  });

  if (isLoading || contactsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </header>
        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48 mb-4" />
                <Skeleton className="h-6 w-16" />
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const getCategoryBadge = (category: string) => {
    const badges = {
      receipt: { className: "bg-purple-100 text-purple-700" },
      bill: { className: "bg-pink-100 text-pink-700" },
      statement: { className: "bg-cyan-100 text-cyan-700" },
      confirmation: { className: "bg-cyan-100 text-cyan-700" },
      invoice: { className: "bg-pink-100 text-pink-700" },
      other: { className: "bg-gray-100 text-gray-700" },
    };
    
    return badges[category as keyof typeof badges] || badges.other;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Contacts</h1>
          <p className="text-gray-600 mt-1">Manage your financial email contacts and relationships</p>
        </div>
      </header>

      <main className="p-6">
        {!contacts || contacts.length === 0 ? (
          <Card className="shadow-modern border border-gray-100">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
                <Mail className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
              <p className="text-gray-500 mb-6">
                Sync your Gmail to automatically discover financial contacts from your emails
              </p>
              <Button className="gradient-bg text-white">
                Sync Gmail
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact) => {
              const badge = getCategoryBadge(contact.category || 'other');
              
              return (
                <Card key={contact.id} className="shadow-modern hover:shadow-modern-lg transition-all duration-200 border border-gray-100">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-lg">
                          {contact.name?.charAt(0) || contact.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {contact.name || contact.email.split('@')[0]}
                        </h3>
                        <p className="text-sm text-gray-500">{contact.email}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={badge.className}>
                          {(contact.category || 'other').charAt(0).toUpperCase() + 
                           (contact.category || 'other').slice(1)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {contact.emailCount} email{contact.emailCount !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Globe className="h-4 w-4" />
                        <span>{contact.domain}</span>
                      </div>

                      {contact.lastEmailDate && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Last email: {new Date(contact.lastEmailDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Emails
                      </Button>
                      <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

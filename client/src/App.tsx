import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/dashboard/sidebar";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Emails from "@/pages/emails";
import Contacts from "@/pages/contacts";
import Labels from "@/pages/labels";
import BulkOperations from "@/pages/bulk-operations";
import Export from "@/pages/export";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 via-cyan-600 to-pink-600 p-1">
            <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar emailCount={124} />
      <div className="ml-64 flex-1">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/emails" component={Emails} />
          <Route path="/contacts" component={Contacts} />
          <Route path="/labels" component={Labels} />
          <Route path="/bulk-operations" component={BulkOperations} />
          <Route path="/export" component={Export} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

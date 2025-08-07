import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import NavigationTabs from "@/components/navigation-tabs";
import StatsOverview from "@/components/dashboard/stats-overview";
import QuickFilters from "@/components/dashboard/quick-filters";
import EmailsTable from "@/components/dashboard/emails-table";
import LabelsGrid from "@/components/labels/labels-grid";
import FiltersList from "@/components/filters/filters-list";
import ContactsTable from "@/components/contacts/contacts-table";
import ExportOptions from "@/components/export/export-options";
import { BulkOperationsDashboard } from "@/components/bulk-operations/bulk-operations-dashboard";
import { Settings, RefreshCw, User, Bell } from "lucide-react";
import appIconPath from "@assets/1752568649408_1753356371508.png";

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState("synced");
  const { toast } = useToast();

  const handleManualSync = async () => {
    setSyncStatus("syncing");
    try {
      const response = await fetch(`/api/users/${user.id}/sync`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setSyncStatus("synced");
        toast({
          title: "Sync completed",
          description: "Your emails have been synchronized",
        });
      } else {
        throw new Error("Sync failed");
      }
    } catch (error) {
      setSyncStatus("error");
      toast({
        title: "Sync failed",
        description: "Failed to synchronize emails",
        variant: "destructive",
      });
    }
  };

  const handleCreateLabel = () => {
    toast({
      title: "Create Label",
      description: "Label creation form would open here",
    });
  };

  const handleCreateFilter = () => {
    toast({
      title: "Create Filter",
      description: "Filter creation form would open here",
    });
  };

  const handleSyncContacts = () => {
    toast({
      title: "Syncing Contacts",
      description: "Extracting contacts from financial emails",
    });
  };

  const handleCreateExport = () => {
    toast({
      title: "Create Export",
      description: "Export creation form would open here",
    });
  };

  const handleOpenSettings = () => {
    toast({
      title: "Settings",
      description: "Settings panel would open here",
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <StatsOverview userId={user.id} />
            <QuickFilters 
              activeFilter={activeFilter} 
              onFilterChange={setActiveFilter} 
            />
            <EmailsTable 
              userId={user.id} 
              category={activeFilter || undefined} 
            />
          </div>
        );
      case "labels":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manage Labels</h3>
                <p className="text-gray-600">Create and organize custom labels for your financial emails</p>
              </div>
              <Button onClick={handleCreateLabel} className="bg-purple-gradient hover:shadow-lg">
                <i className="fas fa-plus mr-2"></i>
                Create Label
              </Button>
            </div>
            <LabelsGrid userId={user.id} onCreateLabel={handleCreateLabel} />
          </div>
        );
      case "filters":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Email Filters</h3>
                <p className="text-gray-600">Automate email processing with intelligent filters</p>
              </div>
              <Button onClick={handleCreateFilter} className="bg-cyan-gradient hover:shadow-lg">
                <i className="fas fa-plus mr-2"></i>
                Create Filter
              </Button>
            </div>
            <FiltersList userId={user.id} onCreateFilter={handleCreateFilter} />
          </div>
        );
      case "contacts":
        return (
          <div className="space-y-6">
            <ContactsTable userId={user.id} onSyncContacts={handleSyncContacts} />
          </div>
        );
      case "export":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Export & Backup</h3>
                <p className="text-gray-600">Export your data to Google Sheets, Drive, and other formats</p>
              </div>
              <Button onClick={handleCreateExport} className="bg-pink-gradient hover:shadow-lg">
                <i className="fas fa-plus mr-2"></i>
                New Export
              </Button>
            </div>
            <ExportOptions userId={user.id} onCreateExport={handleCreateExport} />
          </div>
        );
      case "bulk":
        return (
          <div className="space-y-6">
            <BulkOperationsDashboard userId={user.id} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-cyan-50/30">
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white shadow-modern-lg border-r border-gray-200 min-h-screen">
          <div className="p-6">
            {/* Logo Section */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-cyan-600 to-pink-600 p-0.5">
                <div className="w-full h-full rounded-lg bg-white flex items-center justify-center">
                  <img 
                    src={appIconPath} 
                    alt="Finance Manager" 
                    className="w-6 h-6 rounded-md"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Finance Manager</h1>
                <p className="text-xs text-gray-500">Gmail Integration</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              {[
                { id: "dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt", gradient: "from-purple-500 to-purple-600" },
                { id: "labels", label: "Labels", icon: "fas fa-tags", gradient: "from-cyan-500 to-cyan-600" },
                { id: "filters", label: "Filters", icon: "fas fa-filter", gradient: "from-pink-500 to-pink-600" },
                { id: "contacts", label: "Contacts", icon: "fas fa-address-book", gradient: "from-purple-500 to-cyan-500" },
                { id: "export", label: "Export", icon: "fas fa-download", gradient: "from-cyan-500 to-pink-500" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <i className={`${tab.icon} text-lg`}></i>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* User Profile Section */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Top Header */}
          <header className="bg-white shadow-modern border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeTab === "dashboard" && "Dashboard"}
                  {activeTab === "labels" && "Finance Labels"}
                  {activeTab === "filters" && "Email Filters"}
                  {activeTab === "contacts" && "Financial Contacts"}
                  {activeTab === "export" && "Export & Backup"}
                </h2>
                <p className="text-gray-600 mt-1">
                  {activeTab === "dashboard" && "Overview of your financial email management"}
                  {activeTab === "labels" && "Organize emails with custom labels"}
                  {activeTab === "filters" && "Automate email processing with smart filters"}
                  {activeTab === "contacts" && "Manage your financial contacts"}
                  {activeTab === "export" && "Export data to Google Sheets and Drive"}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Sync Status */}
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50">
                  <RefreshCw className={`h-4 w-4 ${syncStatus === "syncing" ? "animate-spin text-blue-600" : 
                    syncStatus === "synced" ? "text-green-600" : "text-red-600"}`} />
                  <span className="text-sm font-medium">
                    {syncStatus === "synced" && "Synced"}
                    {syncStatus === "syncing" && "Syncing..."}
                    {syncStatus === "error" && "Sync Error"}
                  </span>
                </div>
                
                {/* Action Buttons */}
                <Button
                  onClick={handleManualSync}
                  disabled={syncStatus === "syncing"}
                  variant="outline"
                  size="sm"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </Button>
                
                <Button
                  onClick={handleOpenSettings}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-8 max-h-[calc(100vh-140px)] overflow-y-auto">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

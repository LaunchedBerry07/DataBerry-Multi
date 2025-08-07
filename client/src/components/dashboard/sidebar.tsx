import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ChartLine, 
  Inbox, 
  NotebookTabs, 
  Tags, 
  ListTodo, 
  Download,
  ChevronLeft,
  Settings,
  Mail
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  emailCount?: number;
}

export default function Sidebar({ emailCount = 0 }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { path: "/", icon: ChartLine, label: "Dashboard", badge: null },
    { path: "/emails", icon: Inbox, label: "Financial Emails", badge: emailCount },
    { path: "/contacts", icon: NotebookTabs, label: "Contacts", badge: null },
    { path: "/labels", icon: Tags, label: "Labels", badge: null },
    { path: "/bulk-operations", icon: ListTodo, label: "Bulk Operations", badge: null },
    { path: "/export", icon: Download, label: "Export", badge: null },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-modern-lg sidebar-transition ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className={`flex items-center space-x-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
            <Mail className="text-white h-5 w-5" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold gradient-text">FinanceFlow</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100"
        >
          <ChevronLeft className={`h-5 w-5 text-gray-500 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <a className={`flex items-center space-x-3 p-3 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-purple-50 to-cyan-50 text-purple-700'
                  : 'hover:bg-gray-100 text-gray-700'
              } ${collapsed ? 'justify-center' : ''}`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <img 
              src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=8B5CF6&color=ffffff`} 
              alt="User Profile" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = "/api/logout"}
              className="p-2 hover:bg-gray-100"
            >
              <Settings className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs: Tab[] = [
  { id: "dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt" },
  { id: "labels", label: "Labels", icon: "fas fa-tags" },
  { id: "filters", label: "Filters", icon: "fas fa-filter" },
  { id: "contacts", label: "Contacts", icon: "fas fa-address-book" },
  { id: "bulk", label: "Bulk Operations", icon: "fas fa-bolt" },
  { id: "export", label: "Export", icon: "fas fa-download" },
];

export default function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <nav className="bg-gray-50 border-b border-gray-200">
      <div className="flex space-x-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-6 py-3 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                : "text-gray-500 hover:text-blue-600 hover:bg-white"
            )}
          >
            <i className={`${tab.icon} mr-2`}></i>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

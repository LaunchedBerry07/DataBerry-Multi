import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Receipt, FileText, CreditCard, Building, CheckCircle, Filter } from "lucide-react";

interface QuickFiltersProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

const filters = [
  { 
    id: "receipt", 
    label: "Receipts", 
    icon: Receipt,
    gradient: "from-purple-500 to-purple-600",
    bgGradient: "from-purple-50 to-purple-100",
    borderColor: "border-purple-200"
  },
  { 
    id: "bill", 
    label: "Bills", 
    icon: FileText,
    gradient: "from-cyan-500 to-cyan-600",
    bgGradient: "from-cyan-50 to-cyan-100",
    borderColor: "border-cyan-200"
  },
  { 
    id: "invoice", 
    label: "Invoices", 
    icon: CreditCard,
    gradient: "from-pink-500 to-pink-600",
    bgGradient: "from-pink-50 to-pink-100",
    borderColor: "border-pink-200"
  },
  { 
    id: "statement", 
    label: "Bank Statements", 
    icon: Building,
    gradient: "from-purple-500 to-cyan-500",
    bgGradient: "from-gray-50 to-gray-100",
    borderColor: "border-gray-200"
  },
  { 
    id: "confirmation", 
    label: "Confirmations", 
    icon: CheckCircle,
    gradient: "from-green-500 to-green-600",
    bgGradient: "from-green-50 to-green-100",
    borderColor: "border-green-200"
  },
];

export default function QuickFilters({ activeFilter, onFilterChange }: QuickFiltersProps) {
  return (
    <div className="bg-white rounded-2xl shadow-modern p-6 border-0">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
          <Filter className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Quick Filters</h3>
          <p className="text-sm text-gray-600">Filter emails by category</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange(null)}
          className={cn(
            "px-4 py-2 rounded-xl font-medium transition-all duration-200",
            activeFilter === null 
              ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg" 
              : "text-gray-600 hover:bg-gray-50 border border-gray-200"
          )}
        >
          All Emails
        </Button>
        {filters.map((filter) => {
          const IconComponent = filter.icon;
          return (
            <Button
              key={filter.id}
              variant="ghost"
              size="sm"
              onClick={() => onFilterChange(filter.id)}
              className={cn(
                "px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2",
                activeFilter === filter.id 
                  ? `bg-gradient-to-r ${filter.gradient} text-white shadow-lg` 
                  : `text-gray-600 hover:bg-gradient-to-r hover:${filter.bgGradient} border ${filter.borderColor}`
              )}
            >
              <IconComponent className="h-4 w-4" />
              <span>{filter.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

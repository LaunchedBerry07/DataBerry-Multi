import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, DollarSign, FileText, Receipt, CreditCard } from "lucide-react";

interface StatsOverviewProps {
  userId: number;
}

export default function StatsOverview({ userId }: StatsOverviewProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/users", userId, "stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse border-0 shadow-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: "Total Emails",
      value: stats?.totalEmails || 0,
      icon: DollarSign,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      change: "+12%",
      changeType: "up",
    },
    {
      label: "Valid Receipts",
      value: stats?.receipts || 0,
      icon: Receipt,
      gradient: "from-cyan-500 to-cyan-600",
      bgGradient: "from-cyan-50 to-cyan-100",
      change: "+8%",
      changeType: "up",
    },
    {
      label: "Pending Bills",
      value: stats?.bills || 0,
      icon: CreditCard,
      gradient: "from-pink-500 to-pink-600",
      bgGradient: "from-pink-50 to-pink-100",
      change: "-3%",
      changeType: "down",
    },
    {
      label: "Bank Statements",
      value: stats?.statements || 0,
      icon: FileText,
      gradient: "from-purple-500 to-cyan-500",
      bgGradient: "from-gray-50 to-gray-100",
      change: "+5%",
      changeType: "up",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {statItems.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <Card key={index} className="border-0 shadow-modern hover:shadow-modern-lg transition-all duration-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.bgGradient} flex items-center justify-center`}>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${item.gradient} flex items-center justify-center`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {item.changeType === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    item.changeType === "up" ? "text-green-600" : "text-red-600"
                  }`}>
                    {item.change}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{item.value.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

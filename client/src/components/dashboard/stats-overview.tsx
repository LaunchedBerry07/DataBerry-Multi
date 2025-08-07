import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Receipt, CreditCard, FileText, TrendingUp, TrendingDown } from "lucide-react";

interface EmailStats {
  totalEmails: number;
  receipts: number;
  bills: number;
  statements: number;
  withAttachments: number;
}

export default function StatsOverview() {
  const { data: stats, isLoading } = useQuery<EmailStats>({
    queryKey: ['/api/emails/stats'],
  });

  const statItems = [
    {
      label: "Total Emails",
      value: stats?.totalEmails || 0,
      icon: Mail,
      color: "purple",
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Valid Receipts",
      value: stats?.receipts || 0,
      icon: Receipt,
      color: "cyan",
      trend: "+8%",
      trendUp: true,
    },
    {
      label: "Pending Bills",
      value: stats?.bills || 0,
      icon: CreditCard,
      color: "pink",
      trend: "-3%",
      trendUp: false,
    },
    {
      label: "Bank Statements",
      value: stats?.statements || 0,
      icon: FileText,
      color: "gray",
      trend: "+5%",
      trendUp: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-12 w-12 rounded-xl mb-4" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        const colorClasses = {
          purple: {
            bg: "bg-gradient-to-r from-purple-50 to-purple-100",
            iconBg: "bg-gradient-to-r from-purple-500 to-purple-600",
            text: "text-purple-700",
          },
          cyan: {
            bg: "bg-gradient-to-r from-cyan-50 to-cyan-100",
            iconBg: "bg-gradient-to-r from-cyan-500 to-cyan-600",
            text: "text-cyan-700",
          },
          pink: {
            bg: "bg-gradient-to-r from-pink-50 to-pink-100",
            iconBg: "bg-gradient-to-r from-pink-500 to-pink-600",
            text: "text-pink-700",
          },
          gray: {
            bg: "bg-gradient-to-r from-gray-50 to-gray-100",
            iconBg: "bg-gradient-to-r from-purple-500 to-cyan-500",
            text: "text-gray-700",
          },
        }[item.color as keyof typeof colorClasses];

        return (
          <Card 
            key={index}
            className="p-6 shadow-modern hover:shadow-modern-lg transition-all duration-200 gradient-card border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${colorClasses.bg} flex items-center justify-center`}>
                <div className={`w-8 h-8 rounded-lg ${colorClasses.iconBg} flex items-center justify-center`}>
                  <Icon className="text-white text-sm h-4 w-4" />
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {item.trendUp ? (
                  <TrendingUp className="text-green-600 text-sm h-4 w-4" />
                ) : (
                  <TrendingDown className="text-red-600 text-sm h-4 w-4" />
                )}
                <span className={`text-sm font-medium ${item.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {item.trend}
                </span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {item.value.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">{item.label}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

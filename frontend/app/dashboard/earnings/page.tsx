"use client";

import { TrendingUp, Download, Calendar, DollarSign, Activity } from "lucide-react";
import { PageContainer, PageHeader, StatsCard } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Earning = {
  date: string;
  type: string;
  description: string;
  amount: number;
  status: "Credited";
};

const earnings: Earning[] = [
  { date: "2025-11-26", type: "Binary Matching Bonus", description: "Daily pair matching bonus", amount: 250, status: "Credited" },
  { date: "2025-11-25", type: "Binary Matching Bonus", description: "Weekly matching bonus", amount: 500, status: "Credited" },
  { date: "2025-11-24", type: "Binary Matching Bonus", description: "Pair matching completed", amount: 150, status: "Credited" },
  { date: "2025-11-23", type: "Binary Matching Bonus", description: "Daily pair matching", amount: 450, status: "Credited" },
  { date: "2025-11-22", type: "Binary Matching Bonus", description: "Pair matching bonus", amount: 250, status: "Credited" },
  { date: "2025-11-21", type: "Binary Matching Bonus", description: "Weekly pair completion", amount: 450, status: "Credited" },
  { date: "2025-11-20", type: "Binary Matching Bonus", description: "Daily matching bonus", amount: 250, status: "Credited" },
  { date: "2025-11-19", type: "Binary Matching Bonus", description: "Pair matching bonus", amount: 350, status: "Credited" },
];

export default function EarningsPage() {
  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const thisMonth = earnings.filter(e => e.date.startsWith("2025-11")).reduce((sum, e) => sum + e.amount, 0);
  const thisWeek = earnings.slice(0, 3).reduce((sum, e) => sum + e.amount, 0);
  const today = 125;

  return (
    <PageContainer maxWidth="2xl">
      <PageHeader
        icon={<TrendingUp className="w-6 h-6 text-white" />}
        title="My Earnings"
        subtitle="View your binary matching earnings"
        action={
          <Button className="gap-2 bg-primary-500 hover:bg-primary-600 text-white shadow-md">
            <Download className="w-4 h-4" />
            Download Report
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Earnings"
          value={`₹${totalEarnings.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          gradient="bg-green-500"
        />
        <StatsCard
          label="This Month"
          value={`₹${thisMonth.toLocaleString()}`}
          icon={<Calendar className="w-6 h-6 text-blue-600" />}
          gradient="bg-blue-500"
        />
        <StatsCard
          label="This Week"
          value={`₹${thisWeek.toLocaleString()}`}
          icon={<Activity className="w-6 h-6 text-purple-600" />}
          gradient="bg-purple-500"
        />
        <StatsCard
          label="Today"
          value={`₹${today.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
          gradient="bg-orange-500"
        />
      </div>

      {/* Recent Earnings Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border bg-muted/30">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            Recent Earnings
            <span className="text-sm font-normal text-muted-foreground">
              Binary matching bonus history
            </span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Date</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Type</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Description</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Amount</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((earning, index) => (
                <tr
                  key={index}
                  className={cn(
                    "border-b border-border hover:bg-muted/50 transition-colors",
                    index === earnings.length - 1 && "border-0"
                  )}
                >
                  <td className="px-6 py-4 text-sm text-foreground">{earning.date}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{earning.type}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{earning.description}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">
                    ₹{earning.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      {earning.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 text-right">
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
            View All →
          </button>
        </div>
      </div>
    </PageContainer>
  );
}

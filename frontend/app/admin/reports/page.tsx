"use client";

import { useState, useEffect } from "react";
import { FileText, TrendingUp, Users, DollarSign, Calendar } from "lucide-react";
import { PageContainer, PageHeader, StatsCard } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

interface ReportsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalEarnings: number;
    totalWithdrawals: number;
    pendingWithdrawals: number;
    pendingWithdrawalsAmount: number;
    recentRegistrations: number;
  };
  planDistribution: Record<string, number>;
  dailyReports: Array<{
    date: string;
    newUsers: number;
    topups: number;
    payouts: number;
    netBusiness: number;
  }>;
  incomeBreakdown: {
    REFERRAL_INCOME: number;
    MATCHING_INCOME: number;
    LEVEL_INCOME: number;
  };
}

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/reports/dashboard');
        if (response.data.success) {
          setReportsData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchReports();
    }
  }, [user]);

  if (loading) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PageContainer>
    );
  }

  if (!reportsData) {
    return (
      <PageContainer maxWidth="full">
        <div className="text-center text-muted-foreground">No data available</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="full">
      <PageHeader
        icon={<FileText className="w-6 h-6 text-white" />}
        title="Reports"
        subtitle="Comprehensive business analytics and reports"
        action={
          <Button variant="outline" className="gap-2 border-border hover:bg-muted">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </Button>
        }
      />

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Revenue"
          value="₹1.25 Cr"
          icon={<DollarSign className="w-6 h-6 text-blue-600" />}
          gradient="bg-blue-500"
          className="bg-blue-500 text-white"
        />
        <StatsCard
          label="Net Profit"
          value="₹45.7 L"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          gradient="bg-green-500"
          className="bg-green-500 text-white"
        />
        <StatsCard
          label="Total Payouts"
          value="₹75.2 L"
          icon={<DollarSign className="w-6 h-6 text-purple-600" />}
          gradient="bg-purple-500"
          className="bg-purple-500 text-white"
        />
        <StatsCard
          label="Growth Rate"
          value="+77%"
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
          gradient="bg-orange-500"
          className="bg-orange-500 text-white"
        />
      </div>

      {/* Daily Business Report */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm mb-8">
        <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
          <h3 className="font-semibold text-foreground">Daily Business Report</h3>
          <Button variant="ghost" size="sm" className="text-primary-600">Export</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">New Users</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Top-ups</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Payouts</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Net Business</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: "2025-11-26", users: 15, topups: "₹1,25,000", payouts: "₹45,000", net: "₹80,000" },
                { date: "2025-11-25", users: 12, topups: "₹95,000", payouts: "₹32,000", net: "₹63,000" },
                { date: "2025-11-24", users: 18, topups: "₹1,50,000", payouts: "₹55,000", net: "₹95,000" },
                { date: "2025-11-23", users: 10, topups: "₹80,000", payouts: "₹25,000", net: "₹55,000" },
                { date: "2025-11-22", users: 14, topups: "₹1,10,000", payouts: "₹40,000", net: "₹70,000" },
              ].map((row, index) => (
                <tr
                  key={index}
                  className={cn(
                    "border-b border-border hover:bg-muted/50 transition-colors",
                    index === 4 && "border-0"
                  )}
                >
                  <td className="px-6 py-3 text-sm text-foreground">{row.date}</td>
                  <td className="px-6 py-3 text-sm text-foreground">{row.users}</td>
                  <td className="px-6 py-3 text-sm text-green-600 font-medium">{row.topups}</td>
                  <td className="px-6 py-3 text-sm text-red-600 font-medium">{row.payouts}</td>
                  <td className="px-6 py-3 text-sm font-bold text-foreground">{row.net}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Income Summary */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-6">Income Summary</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Binary Matching Bonus</span>
                <span className="font-medium text-foreground">₹12,45,000</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[75%] rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Level Income</span>
                <span className="font-medium text-foreground">₹5,32,000</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[45%] rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Direct Referral Bonus</span>
                <span className="font-medium text-foreground">₹3,15,000</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[30%] rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Package Distribution */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-6">Package Distribution</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Professional Plan</span>
                <span className="font-medium text-foreground">450 Users</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[60%] rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Business Plan</span>
                <span className="font-medium text-foreground">280 Users</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-pink-500 w-[40%] rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Starter Plan</span>
                <span className="font-medium text-foreground">120 Users</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 w-[20%] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

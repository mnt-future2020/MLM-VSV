"use client";

import { Users, TrendingUp, Wallet, Gift, ArrowRight, UserPlus, CreditCard } from "lucide-react";
import { PageContainer, PageHeader, StatsCard } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/api";

// Helper function to format date in IST
const formatDateIST = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

interface DashboardData {
  wallet: {
    balance: number;
    totalEarnings: number;
    totalWithdrawals: number;
  };
  team: {
    total: number;
    left: number;
    right: number;
  };
  currentPlan: any;
  rank?: {
    name: string;
    icon: string;
    color: string;
    minPV: number;
  };
  recentTransactions: any[];
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axiosInstance.get('/api/user/dashboard');
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboard();
    }
  }, [user]);

  if (loading) {
    return (
      <PageContainer maxWidth="2xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="2xl">
      <PageHeader
        icon={<TrendingUp className="w-6 h-6 text-white" />}
        title={`Welcome back, ${user?.name || 'User'}!`}
        subtitle="Here's what's happening with your account today."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Earnings"
          value={`₹${dashboardData?.wallet?.totalEarnings || 0}`}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          gradient="bg-green-500"
          trend={{ value: "Lifetime earnings", isPositive: true }}
        />
        <StatsCard
          label="Available Balance"
          value={`₹${dashboardData?.wallet?.balance || 0}`}
          icon={<Wallet className="w-6 h-6 text-primary-600" />}
          gradient="bg-primary-500"
          trend={{ value: "Ready to withdraw", isPositive: true }}
        />
        <StatsCard
          label="Team Members"
          value={String(dashboardData?.team?.total || 0)}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          gradient="bg-blue-500"
          trend={{ value: `Left: ${dashboardData?.team?.left || 0}, Right: ${dashboardData?.team?.right || 0}`, isPositive: true }}
        />
        <StatsCard
          label="Current Plan"
          value={dashboardData?.currentPlan?.name || "No Plan"}
          icon={<Gift className="w-6 h-6 text-purple-600" />}
          gradient="bg-purple-500"
          trend={{ value: dashboardData?.currentPlan ? `${dashboardData.currentPlan.pv} PV` : "Activate a plan", isPositive: true }}
        />
        {dashboardData?.rank && (
          <div className="bg-card border-2 border-border rounded-xl p-6 shadow-lg" style={{ borderColor: dashboardData.rank.color }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Current Rank</p>
              <span className="text-3xl">{dashboardData.rank.icon}</span>
            </div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: dashboardData.rank.color }}>
              {dashboardData.rank.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Minimum: {dashboardData.rank.minPV} PV
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/dashboard/top-up" className="w-full">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 shadow-sm">
                <CreditCard className="w-6 h-6" />
                <span>Upgrade Plan</span>
              </Button>
            </Link>
            <Link href="/dashboard/new-member" className="w-full">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-sm">
                <UserPlus className="w-6 h-6" />
                <span>Invite Member</span>
              </Button>
            </Link>
            <Link href="/dashboard/payout-reports" className="w-full sm:col-span-2">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 shadow-sm">
                <Wallet className="w-6 h-6" />
                <span>Request Withdrawal</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
            <Link href="/dashboard/transactions">
              <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
              dashboardData.recentTransactions.slice(0, 4).map((transaction: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      transaction.amount > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    )}>
                      {transaction.amount > 0 ? <TrendingUp className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{transaction.type || transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      transaction.amount > 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Team Structure Preview */}
      {/* <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Team Overview</h2>
          <Link href="/dashboard/team/tree">
            <Button variant="outline" size="sm" className="gap-2">
              View Full Tree
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex flex-col items-center justify-center p-6 bg-primary-50 rounded-xl border border-primary-100">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-3 shadow-sm">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Team</p>
            <p className="text-3xl font-bold text-primary-700">{dashboardData?.team?.total || 0}</p>
          </div>
          
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
              <p className="text-sm text-muted-foreground mb-1">Left Team</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-foreground">{dashboardData?.team?.left || 0}</p>
                <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ 
                      width: dashboardData?.team?.total ? `${(dashboardData.team.left / dashboardData.team.total) * 100}%` : '0%' 
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card hover:border-purple-200 hover:bg-purple-50/30 transition-colors">
              <p className="text-sm text-muted-foreground mb-1">Right Team</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-foreground">{dashboardData?.team?.right || 0}</p>
                <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full" 
                    style={{ 
                      width: dashboardData?.team?.total ? `${(dashboardData.team.right / dashboardData.team.total) * 100}%` : '0%' 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </PageContainer>
  );
}

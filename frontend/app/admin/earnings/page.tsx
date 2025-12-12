"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Download, DollarSign, Package, BarChart3, Calendar, Clock } from "lucide-react";
import { PageContainer, PageHeader, StatsCard } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  userName: string;
  userReferralId: string;
  amount: number;
  description: string;
  createdAt: string;
}

// Helper function to format date in IST
const formatDateIST = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export default function AdminEarningsPage() {
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalActivations, setTotalActivations] = useState(0);
  const [incomeByPlan, setIncomeByPlan] = useState<Record<string, number>>({});
  const [matchingIncomePaid, setMatchingIncomePaid] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [thisMonthRevenue, setThisMonthRevenue] = useState(0);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/earnings');
        if (response.data.success) {
          const data = response.data.data;
          
          // Calculate total revenue from plan activations only
          const planActivationIncome = data.incomeBreakdown?.PLAN_ACTIVATION || 0;
          setTotalRevenue(planActivationIncome);
          setTotalActivations(data.totalActivations || 0);
          setIncomeByPlan(data.incomeByPlan || {});
          
          // Calculate matching income paid to users (for tracking)
          setMatchingIncomePaid(data.incomeBreakdown?.MATCHING_INCOME || 0);
          
          // Filter transactions to show plan activations and matching income
          const filteredTransactions = (data.recentTransactions || []).filter((t: Transaction) => 
            t.type === 'PLAN_ACTIVATION' || t.type === 'MATCHING_INCOME'
          );
          setRecentTransactions(filteredTransactions);

          // Calculate today's and this month's revenue
          const allTransactions = data.allTransactions || [];
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

          let todaySum = 0;
          let monthSum = 0;

          allTransactions.forEach((t: any) => {
            if (t.type === 'PLAN_ACTIVATION') {
              const txnDate = new Date(t.createdAt);
              if (txnDate >= todayStart) todaySum += t.amount || 0;
              if (txnDate >= monthStart) monthSum += t.amount || 0;
            }
          });

          setTodayRevenue(todaySum);
          setThisMonthRevenue(monthSum);
        }
      } catch (error) {
        console.error("Error fetching admin earnings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

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
        icon={<DollarSign className="w-6 h-6 text-white" />}
        title="Revenue & Earnings"
        subtitle="Platform revenue from plan activations and payouts"
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
          label="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          gradient="bg-green-500"
          trend={{ value: `${totalActivations} plan activations`, isPositive: true }}
        />
        <StatsCard
          label="Today's Revenue"
          value={`₹${todayRevenue.toLocaleString()}`}
          icon={<Calendar className="w-6 h-6 text-blue-600" />}
          gradient="bg-blue-500"
          trend={{ value: "Today", isPositive: true }}
        />
        <StatsCard
          label="This Month"
          value={`₹${thisMonthRevenue.toLocaleString()}`}
          icon={<Clock className="w-6 h-6 text-purple-600" />}
          gradient="bg-purple-500"
          trend={{ value: "Current month", isPositive: true }}
        />
        <StatsCard
          label="Matching Income Paid"
          value={`₹${matchingIncomePaid.toLocaleString()}`}
          icon={<BarChart3 className="w-6 h-6 text-orange-600" />}
          gradient="bg-orange-500"
          trend={{ value: "Paid to users", isPositive: true }}
        />
      </div>

      {/* Income Breakdown by Plan */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary-600" />
          Revenue Breakdown by Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(incomeByPlan).map(([planName, amount]) => (
            <div
              key={planName}
              className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-5"
            >
              <p className="text-sm text-primary-700 font-medium mb-2">{planName} Plan</p>
              <p className="text-2xl font-bold text-primary-900">₹{amount.toLocaleString()}</p>
            </div>
          ))}
          {Object.keys(incomeByPlan).length === 0 && (
            <div className="col-span-4 text-center py-8 text-muted-foreground">
              No plan activations yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Recent Transactions
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Plan activations and matching income payouts</p>
        </div>
        <div className="divide-y divide-border">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => {
              const getTypeIcon = () => {
                if (transaction.type === 'MATCHING_INCOME') return '🤝';
                if (transaction.type === 'PLAN_ACTIVATION') return '💰';
                return '💵';
              };
              
              const getTypeColor = () => {
                if (transaction.type === 'MATCHING_INCOME') return 'bg-purple-100 text-purple-700';
                if (transaction.type === 'PLAN_ACTIVATION') return 'bg-green-100 text-green-700';
                return 'bg-gray-100 text-gray-700';
              };

              const getTypeLabel = () => {
                if (transaction.type === 'MATCHING_INCOME') return 'Matching Income Paid';
                if (transaction.type === 'PLAN_ACTIVATION') return 'Plan Activation Revenue';
                return transaction.type.replace(/_/g, ' ');
              };

              const isRevenue = transaction.type === 'PLAN_ACTIVATION';

              return (
                <div
                  key={transaction.id}
                  className="p-6 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl">{getTypeIcon()}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">
                              {getTypeLabel()}
                            </h3>
                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getTypeColor())}>
                              {transaction.userName}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {transaction.userReferralId}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground ml-11">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 ml-11">
                        {formatDateIST(transaction.createdAt)} IST
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-2xl font-bold",
                        isRevenue ? "text-green-600" : "text-orange-600"
                      )}>
                        {isRevenue ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </p>
                      <span className={cn(
                        "text-xs",
                        isRevenue ? "text-green-600" : "text-orange-600"
                      )}>
                        {isRevenue ? 'Revenue' : 'Payout'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Transactions Yet</h3>
              <p className="text-muted-foreground">
                Revenue and payouts will appear here as users join and earn
              </p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

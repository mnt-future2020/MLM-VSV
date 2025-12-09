"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Download, DollarSign, Package, BarChart3, Users } from "lucide-react";
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

export default function AdminEarningsPage() {
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalActivations, setTotalActivations] = useState(0);
  const [incomeBreakdown, setIncomeBreakdown] = useState<Record<string, number>>({});
  const [incomeByPlan, setIncomeByPlan] = useState<Record<string, number>>({});
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/earnings');
        if (response.data.success) {
          const data = response.data.data;
          setTotalEarnings(data.totalEarnings || 0);
          setTotalActivations(data.totalActivations || 0);
          setIncomeBreakdown(data.incomeBreakdown || {});
          setIncomeByPlan(data.incomeByPlan || {});
          setRecentTransactions(data.recentTransactions || []);
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
        title="Admin Earnings"
        subtitle="Revenue from plan activations"
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
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          gradient="bg-green-500"
          trend={{ value: "All income types", isPositive: true }}
        />
        <StatsCard
          label="Referral Income"
          value={`₹${(incomeBreakdown.REFERRAL_INCOME || 0).toLocaleString()}`}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          gradient="bg-blue-500"
          trend={{ value: "Direct referrals", isPositive: true }}
        />
        <StatsCard
          label="Matching Income"
          value={`₹${(incomeBreakdown.MATCHING_INCOME || 0).toLocaleString()}`}
          icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
          gradient="bg-purple-500"
          trend={{ value: "Binary matching", isPositive: true }}
        />
        <StatsCard
          label="Plan Activations"
          value={`₹${(incomeBreakdown.PLAN_ACTIVATION || 0).toLocaleString()}`}
          icon={<Package className="w-6 h-6 text-yellow-600" />}
          gradient="bg-yellow-500"
          trend={{ value: `${totalActivations} activations`, isPositive: true }}
        />
      </div>

      {/* Income Breakdown by Plan */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary-600" />
          Income Breakdown by Plan
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
            Recent Earnings
          </h2>
        </div>
        <div className="divide-y divide-border">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => {
              const getTypeIcon = () => {
                if (transaction.type === 'REFERRAL_INCOME') return '👥';
                if (transaction.type === 'MATCHING_INCOME') return '🤝';
                if (transaction.type === 'LEVEL_INCOME') return '📊';
                if (transaction.type === 'PLAN_ACTIVATION') return '💰';
                return '💵';
              };
              
              const getTypeColor = () => {
                if (transaction.type === 'REFERRAL_INCOME') return 'bg-blue-100 text-blue-700';
                if (transaction.type === 'MATCHING_INCOME') return 'bg-purple-100 text-purple-700';
                if (transaction.type === 'LEVEL_INCOME') return 'bg-green-100 text-green-700';
                if (transaction.type === 'PLAN_ACTIVATION') return 'bg-yellow-100 text-yellow-700';
                return 'bg-gray-100 text-gray-700';
              };

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
                              {transaction.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                        {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        +₹{transaction.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Earnings Yet</h3>
              <p className="text-muted-foreground">
                Your earnings will appear here as users join and activate plans
              </p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

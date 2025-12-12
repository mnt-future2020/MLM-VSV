"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Download, DollarSign, Activity, Users, Gift } from "lucide-react";
import { PageContainer, PageHeader, StatsCard } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { axiosInstance } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  status: string;
}

export default function EarningsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await axiosInstance.get('/api/wallet/transactions?limit=100');
        if (response.data.success) {
          // Filter only credit transactions (earnings)
          const earnings = response.data.data.filter((t: Transaction) => t.amount > 0);
          setTransactions(earnings);
        }
      } catch (error) {
        console.error("Error fetching earnings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEarnings();
    }
  }, [user]);

  // Calculate stats
  const totalEarnings = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  const referralIncome = transactions
    .filter(t => t.type === 'REFERRAL_INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const matchingIncome = transactions
    .filter(t => t.type === 'MATCHING_INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const levelIncome = transactions
    .filter(t => t.type === 'LEVEL_INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

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
        title="My Earnings"
        subtitle="Breakdown of all your income sources"
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
          value={`₹${totalEarnings}`}
          icon={<TrendingUp className="w-6 h-6 text-primary-600" />}
          gradient="bg-primary-500"
          trend={{ value: "All time", isPositive: true }}
        />
      
        <StatsCard
          label="Matching Income"
          value={`₹${matchingIncome}`}
          icon={<Activity className="w-6 h-6 text-green-600" />}
          gradient="bg-green-500"
          trend={{ value: "Binary PV matching", isPositive: true }}
        />
       
      </div>

      {/* Income Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-700">Referral Income</p>
              <p className="text-2xl font-bold text-blue-900">₹{referralIncome}</p>
            </div>
          </div>
          <p className="text-xs text-blue-600">Earned from direct referrals joining with plans</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-700">Matching Income</p>
              <p className="text-2xl font-bold text-green-900">₹{matchingIncome}</p>
            </div>
          </div>
          <p className="text-xs text-green-600">Earned from left-right team PV matching</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-700">Level Income</p>
              <p className="text-2xl font-bold text-purple-900">₹{levelIncome}</p>
            </div>
          </div>
          <p className="text-xs text-purple-600">Earned from team level commissions</p>
        </div>
      </div>

      {/* Earnings History */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Earnings History</h3>
          <p className="text-sm text-muted-foreground mt-1">All credit transactions</p>
        </div>
        <div className="divide-y divide-border">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-muted/30 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{transaction.type.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-muted-foreground">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">+₹{transaction.amount}</p>
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 mt-1">
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No earnings yet</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

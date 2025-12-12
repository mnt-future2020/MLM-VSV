"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Download, DollarSign, Activity, Wallet, Calendar } from "lucide-react";
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
  pv?: number;
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

export default function EarningsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        // Fetch wallet info
        const walletResponse = await axiosInstance.get('/api/wallet');
        if (walletResponse.data.success) {
          setWalletBalance(walletResponse.data.data?.balance || 0);
        }

        // Fetch transactions
        const response = await axiosInstance.get('/api/wallet/transactions?limit=100');
        if (response.data.success) {
          // Filter only earnings transactions (MATCHING_INCOME only - referral income removed)
          const earnings = response.data.data.filter((t: Transaction) => 
            t.amount > 0 && t.type === 'MATCHING_INCOME'
          );
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
  
  const matchingIncome = transactions
    .filter(t => t.type === 'MATCHING_INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate today's and this month's earnings
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayEarnings = transactions
    .filter(t => new Date(t.createdAt) >= todayStart)
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthEarnings = transactions
    .filter(t => new Date(t.createdAt) >= monthStart)
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate total PV matched
  const totalPVMatched = transactions.reduce((sum, t) => sum + (t.pv || 0), 0);

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
        subtitle="Your matching income from binary PV matching"
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
          icon={<TrendingUp className="w-6 h-6 text-primary-600" />}
          gradient="bg-primary-500"
          trend={{ value: "All time matching income", isPositive: true }}
        />
      
        <StatsCard
          label="Wallet Balance"
          value={`₹${walletBalance.toLocaleString()}`}
          icon={<Wallet className="w-6 h-6 text-green-600" />}
          gradient="bg-green-500"
          trend={{ value: "Available to withdraw", isPositive: true }}
        />

        <StatsCard
          label="Today's Earnings"
          value={`₹${todayEarnings.toLocaleString()}`}
          icon={<Calendar className="w-6 h-6 text-blue-600" />}
          gradient="bg-blue-500"
          trend={{ value: "Today", isPositive: todayEarnings > 0 }}
        />

        <StatsCard
          label="This Month"
          value={`₹${thisMonthEarnings.toLocaleString()}`}
          icon={<Activity className="w-6 h-6 text-purple-600" />}
          gradient="bg-purple-500"
          trend={{ value: "Current month", isPositive: thisMonthEarnings > 0 }}
        />
      </div>

      {/* Matching Income Explanation */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">Binary Matching Income</h3>
            <p className="text-sm text-green-700 mb-3">
              Earn by building balanced teams on both left and right legs. When PV accumulates on both sides, 
              the system matches them and pays you based on your plan's matching rate.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-white/60 rounded-lg p-3">
                <p className="text-xs text-green-600 mb-1">Total Matched PV</p>
                <p className="text-xl font-bold text-green-900">{totalPVMatched} PV</p>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <p className="text-xs text-green-600 mb-1">Matching Rate</p>
                <p className="text-xl font-bold text-green-900">₹25 / PV</p>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <p className="text-xs text-green-600 mb-1">Total Earned</p>
                <p className="text-xl font-bold text-green-900">₹{matchingIncome.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">How Binary Matching Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-blue-600">1</span>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Build Teams</p>
            <p className="text-xs text-muted-foreground">Add members to your left and right legs</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-green-600">2</span>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Accumulate PV</p>
            <p className="text-xs text-muted-foreground">Each plan activation adds PV to your count</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-purple-600">3</span>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">PV Matching</p>
            <p className="text-xs text-muted-foreground">min(leftPV, rightPV) = Matched PV</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-orange-600">4</span>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Earn Income</p>
            <p className="text-xs text-muted-foreground">Matched PV × ₹25 = Your income</p>
          </div>
        </div>
      </div>

      {/* Earnings History */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Earnings History</h3>
          <p className="text-sm text-muted-foreground mt-1">All your matching income transactions</p>
        </div>
        <div className="divide-y divide-border">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-muted/30 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Matching Income</p>
                    <p className="text-sm text-muted-foreground">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateIST(transaction.createdAt)} IST
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">+₹{transaction.amount.toLocaleString()}</p>
                  {transaction.pv && (
                    <p className="text-xs text-muted-foreground">{transaction.pv} PV matched</p>
                  )}
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 mt-1">
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-semibold text-foreground mb-2">No Earnings Yet</p>
              <p className="text-muted-foreground mb-4">
                Build your team on both legs to start earning matching income
              </p>
              <p className="text-sm text-muted-foreground">
                When both left and right PV accumulate, you'll earn ₹25 for each matched PV
              </p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

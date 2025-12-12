"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Download, DollarSign, Package, BarChart3, Calendar, Clock, Wallet, Activity, Users, CreditCard } from "lucide-react";
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
  isAdminTransaction?: boolean;
}

interface AdminPV {
  leftPV: number;
  rightPV: number;
  totalPV: number;
  matchablePV: number;
}

interface AdminWallet {
  balance: number;
  totalEarnings: number;
  totalWithdrawals: number;
}

interface AdminEarnings {
  MATCHING_INCOME: number;
  REFERRAL_INCOME: number;
  LEVEL_INCOME: number;
  TOTAL: number;
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
  
  // Platform Stats
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [totalActivations, setTotalActivations] = useState(0);
  const [incomeByPlan, setIncomeByPlan] = useState<Record<string, number>>({});
  
  // Payouts
  const [totalPayouts, setTotalPayouts] = useState(0);
  const [matchingIncomePaid, setMatchingIncomePaid] = useState(0);
  const [referralIncomePaid, setReferralIncomePaid] = useState(0);
  const [levelIncomePaid, setLevelIncomePaid] = useState(0);
  
  // Today/Month
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [thisMonthRevenue, setThisMonthRevenue] = useState(0);
  
  // Admin Personal
  const [adminPV, setAdminPV] = useState<AdminPV>({ leftPV: 0, rightPV: 0, totalPV: 0, matchablePV: 0 });
  const [adminWallet, setAdminWallet] = useState<AdminWallet>({ balance: 0, totalEarnings: 0, totalWithdrawals: 0 });
  const [adminEarnings, setAdminEarnings] = useState<AdminEarnings>({ MATCHING_INCOME: 0, REFERRAL_INCOME: 0, LEVEL_INCOME: 0, TOTAL: 0 });
  
  // Transactions
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/earnings');
        if (response.data.success) {
          const data = response.data.data;
          
          // Platform stats
          setTotalRevenue(data.totalRevenue || 0);
          setNetProfit(data.netProfit || 0);
          setTotalActivations(data.totalActivations || 0);
          setIncomeByPlan(data.incomeByPlan || {});
          
          // Payouts
          setTotalPayouts(data.totalPayouts || 0);
          setMatchingIncomePaid(data.totalMatchingPaid || 0);
          setReferralIncomePaid(data.totalReferralPaid || 0);
          setLevelIncomePaid(data.totalLevelPaid || 0);
          
          // Today/Month
          setTodayRevenue(data.todayRevenue || 0);
          setThisMonthRevenue(data.monthRevenue || 0);
          
          // Admin personal
          setAdminPV(data.adminPV || { leftPV: 0, rightPV: 0, totalPV: 0, matchablePV: 0 });
          setAdminWallet(data.adminWallet || { balance: 0, totalEarnings: 0, totalWithdrawals: 0 });
          setAdminEarnings(data.adminEarnings || { MATCHING_INCOME: 0, REFERRAL_INCOME: 0, LEVEL_INCOME: 0, TOTAL: 0 });
          
          // Transactions
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
        title="Admin Earnings & Revenue"
        subtitle="Platform revenue, payouts, and your personal earnings"
        action={
          <Button className="gap-2 bg-primary-500 hover:bg-primary-600 text-white shadow-md">
            <Download className="w-4 h-4" />
            Download Report
          </Button>
        }
      />

      {/* ============ PLATFORM REVENUE STATS ============ */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Platform Revenue
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
            gradient="bg-green-500"
            trend={{ value: `${totalActivations} activations`, isPositive: true }}
          />
          <StatsCard
            label="Net Profit"
            value={`₹${netProfit.toLocaleString()}`}
            icon={<Wallet className="w-6 h-6 text-emerald-600" />}
            gradient="bg-emerald-500"
            trend={{ value: "Revenue - Payouts", isPositive: netProfit > 0 }}
          />
          <StatsCard
            label="Today's Revenue"
            value={`₹${todayRevenue.toLocaleString()}`}
            icon={<Calendar className="w-6 h-6 text-blue-600" />}
            gradient="bg-blue-500"
            trend={{ value: "Today", isPositive: todayRevenue > 0 }}
          />
          <StatsCard
            label="This Month"
            value={`₹${thisMonthRevenue.toLocaleString()}`}
            icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
            gradient="bg-purple-500"
            trend={{ value: "Current month", isPositive: thisMonthRevenue > 0 }}
          />
        </div>
      </div>

      {/* ============ TOTAL PAYOUTS TO USERS ============ */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-orange-600" />
          Total Payouts to Users
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-5">
            <p className="text-sm text-orange-700 font-medium mb-2">Total Payouts</p>
            <p className="text-2xl font-bold text-orange-900">₹{totalPayouts.toLocaleString()}</p>
            <p className="text-xs text-orange-600 mt-1">All income paid to users</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5">
            <p className="text-sm text-purple-700 font-medium mb-2">Matching Income Paid</p>
            <p className="text-2xl font-bold text-purple-900">₹{matchingIncomePaid.toLocaleString()}</p>
            <p className="text-xs text-purple-600 mt-1">Binary PV matching</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
            <p className="text-sm text-blue-700 font-medium mb-2">Referral Income Paid</p>
            <p className="text-2xl font-bold text-blue-900">₹{referralIncomePaid.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">Direct referral bonus</p>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-xl p-5">
            <p className="text-sm text-teal-700 font-medium mb-2">Level Income Paid</p>
            <p className="text-2xl font-bold text-teal-900">₹{levelIncomePaid.toLocaleString()}</p>
            <p className="text-xs text-teal-600 mt-1">Level-based income</p>
          </div>
        </div>
      </div>

      {/* ============ ADMIN'S PERSONAL EARNINGS ============ */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Your Personal Earnings (Admin)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-white/70 text-sm mb-1">Wallet Balance</p>
            <p className="text-2xl font-bold">₹{adminWallet.balance.toLocaleString()}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-white/70 text-sm mb-1">Total Earnings</p>
            <p className="text-2xl font-bold">₹{adminWallet.totalEarnings.toLocaleString()}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-white/70 text-sm mb-1">Matching Income</p>
            <p className="text-2xl font-bold">₹{adminEarnings.MATCHING_INCOME.toLocaleString()}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-white/70 text-sm mb-1">Referral Income</p>
            <p className="text-2xl font-bold">₹{adminEarnings.REFERRAL_INCOME.toLocaleString()}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-white/70 text-sm mb-1">Level Income</p>
            <p className="text-2xl font-bold">₹{adminEarnings.LEVEL_INCOME.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* ============ ADMIN PV STATS ============ */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 mb-8 text-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Admin Matching Points (PV)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-white/70 text-sm mb-1">Left PV</p>
            <p className="text-3xl font-bold">{adminPV.leftPV}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-white/70 text-sm mb-1">Right PV</p>
            <p className="text-3xl font-bold">{adminPV.rightPV}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-white/70 text-sm mb-1">Matchable PV</p>
            <p className="text-3xl font-bold">{adminPV.matchablePV}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-white/70 text-sm mb-1">Total PV</p>
            <p className="text-3xl font-bold">{adminPV.totalPV}</p>
          </div>
        </div>
      </div>

      {/* ============ INCOME BY PLAN ============ */}
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

      {/* ============ PROFIT SUMMARY ============ */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-green-900 mb-4">Profit Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-white/60 rounded-lg">
            <p className="text-sm text-green-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-green-800">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">From all plan activations</p>
          </div>
          <div className="text-center p-4 bg-white/60 rounded-lg">
            <p className="text-sm text-orange-600 mb-1">Total Payouts</p>
            <p className="text-2xl font-bold text-orange-800">- ₹{totalPayouts.toLocaleString()}</p>
            <p className="text-xs text-orange-600 mt-1">All income paid to users</p>
          </div>
          <div className="text-center p-4 bg-green-100/60 rounded-lg border-2 border-green-300">
            <p className="text-sm text-green-700 mb-1 font-medium">Net Profit</p>
            <p className="text-3xl font-bold text-green-900">₹{netProfit.toLocaleString()}</p>
            <p className="text-xs text-green-700 mt-1">Platform earnings</p>
          </div>
        </div>
      </div>

      {/* ============ RECENT TRANSACTIONS ============ */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Recent Transactions
          </h2>
          <p className="text-sm text-muted-foreground mt-1">All income types - Plan activations, Matching, Referral, Level</p>
        </div>
        <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => {
              const getTypeIcon = () => {
                switch(transaction.type) {
                  case 'MATCHING_INCOME': return '🤝';
                  case 'PLAN_ACTIVATION': return '💰';
                  case 'REFERRAL_INCOME': return '👥';
                  case 'LEVEL_INCOME': return '📊';
                  default: return '💵';
                }
              };
              
              const getTypeColor = () => {
                switch(transaction.type) {
                  case 'MATCHING_INCOME': return 'bg-purple-100 text-purple-700';
                  case 'PLAN_ACTIVATION': return 'bg-green-100 text-green-700';
                  case 'REFERRAL_INCOME': return 'bg-blue-100 text-blue-700';
                  case 'LEVEL_INCOME': return 'bg-teal-100 text-teal-700';
                  default: return 'bg-gray-100 text-gray-700';
                }
              };

              const getTypeLabel = () => {
                switch(transaction.type) {
                  case 'MATCHING_INCOME': return 'Matching Income';
                  case 'PLAN_ACTIVATION': return 'Plan Activation';
                  case 'REFERRAL_INCOME': return 'Referral Income';
                  case 'LEVEL_INCOME': return 'Level Income';
                  default: return transaction.type.replace(/_/g, ' ');
                }
              };

              const isRevenue = transaction.type === 'PLAN_ACTIVATION';

              return (
                <div
                  key={transaction.id}
                  className={cn(
                    "p-6 hover:bg-muted/30 transition-colors",
                    transaction.isAdminTransaction && "bg-indigo-50/50"
                  )}
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
                            {transaction.isAdminTransaction && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                                Your Earning
                              </span>
                            )}
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

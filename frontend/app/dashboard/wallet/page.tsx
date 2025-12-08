"use client";

import { useState, useEffect } from "react";
import { Wallet, TrendingUp, TrendingDown, ArrowRight, DollarSign } from "lucide-react";
import { PageContainer, PageHeader, StatsCard } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { axiosInstance } from "@/lib/api";
import { cn } from "@/lib/utils";

interface WalletData {
  balance: number;
  totalEarnings: number;
  totalWithdrawals: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

export default function WalletPage() {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const [walletRes, transactionsRes] = await Promise.all([
          axiosInstance.get('/api/wallet/balance'),
          axiosInstance.get('/api/wallet/transactions?limit=10')
        ]);

        if (walletRes.data.success) {
          setWalletData(walletRes.data.data);
        }
        if (transactionsRes.data.success) {
          setTransactions(transactionsRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching wallet data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchWalletData();
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
        icon={<Wallet className="w-6 h-6 text-white" />}
        title="My Wallet"
        subtitle="Manage your earnings and withdrawals"
        action={
          <Link href="/dashboard/withdrawal">
            <Button className="bg-primary-600 hover:bg-primary-700">
              Withdraw Funds
            </Button>
          </Link>
        }
      />

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          label="Available Balance"
          value={`₹${walletData?.balance || 0}`}
          icon={<Wallet className="w-6 h-6 text-primary-600" />}
          gradient="bg-primary-500"
          trend={{ value: "Ready to withdraw", isPositive: true }}
        />
        <StatsCard
          label="Total Earnings"
          value={`₹${walletData?.totalEarnings || 0}`}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          gradient="bg-green-500"
          trend={{ value: "Lifetime", isPositive: true }}
        />
        <StatsCard
          label="Total Withdrawals"
          value={`₹${walletData?.totalWithdrawals || 0}`}
          icon={<TrendingDown className="w-6 h-6 text-blue-600" />}
          gradient="bg-blue-500"
          trend={{ value: "All time", isPositive: false }}
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
            <p className="text-sm text-muted-foreground mt-1">Last 10 transactions</p>
          </div>
          <Link href="/dashboard/transactions">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="divide-y divide-border">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-6 hover:bg-muted/30 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      transaction.amount > 0
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    )}
                  >
                    {transaction.amount > 0 ? (
                      <TrendingUp className="w-6 h-6" />
                    ) : (
                      <TrendingDown className="w-6 h-6" />
                    )}
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
                  <p
                    className={cn(
                      "text-lg font-bold",
                      transaction.amount > 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount)}
                  </p>
                  <span
                    className={cn(
                      "inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1",
                      transaction.status === "COMPLETED"
                        ? "bg-green-50 text-green-700"
                        : transaction.status === "PENDING"
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-red-50 text-red-700"
                    )}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Receipt, TrendingUp, TrendingDown, Filter, Download } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { axiosInstance } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axiosInstance.get('/api/wallet/transactions?limit=100');
        if (response.data.success) {
          setTransactions(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "all") return true;
    if (filter === "credit") return t.amount > 0;
    if (filter === "debit") return t.amount < 0;
    return t.type === filter;
  });

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
        icon={<Receipt className="w-6 h-6 text-white" />}
        title="Transaction History"
        subtitle="View all your financial transactions"
        action={
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        }
      />

      {/* Filter */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 flex items-center gap-4">
        <Filter className="w-5 h-5 text-muted-foreground" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="credit">Credits Only</SelectItem>
            <SelectItem value="debit">Debits Only</SelectItem>
            <SelectItem value="REFERRAL_INCOME">Referral Income</SelectItem>
            <SelectItem value="MATCHING_INCOME">Matching Income</SelectItem>
            <SelectItem value="LEVEL_INCOME">Level Income</SelectItem>
            <SelectItem value="WITHDRAWAL_REQUEST">Withdrawals</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto text-sm text-muted-foreground">
          Showing {filteredTransactions.length} transactions
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-card border border-border rounded-xl shadow-sm divide-y divide-border">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
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
                  <p className="font-semibold text-foreground">
                    {transaction.type.replace(/_/g, ' ')}
                  </p>
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
            <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {filter === "all" ? "No transactions yet" : "No transactions matching the filter"}
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

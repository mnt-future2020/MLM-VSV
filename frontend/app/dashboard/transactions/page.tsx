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
      <div className="space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => {
            const isCredit = transaction.amount > 0;
            const getTypeColor = () => {
              if (transaction.type === 'REFERRAL_INCOME') return 'bg-blue-50 border-blue-200';
              if (transaction.type === 'MATCHING_INCOME') return 'bg-purple-50 border-purple-200';
              if (transaction.type === 'LEVEL_INCOME') return 'bg-green-50 border-green-200';
              if (transaction.type === 'WITHDRAWAL_REQUEST') return 'bg-red-50 border-red-200';
              return 'bg-gray-50 border-gray-200';
            };

            const getTypeIcon = () => {
              if (transaction.type === 'REFERRAL_INCOME') return '👥';
              if (transaction.type === 'MATCHING_INCOME') return '🤝';
              if (transaction.type === 'LEVEL_INCOME') return '📊';
              if (transaction.type === 'WITHDRAWAL_REQUEST') return '💸';
              return '💰';
            };

            return (
              <div
                key={transaction.id}
                className={cn(
                  "bg-card border rounded-xl p-5 hover:shadow-md transition-all",
                  getTypeColor()
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl">{getTypeIcon()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground text-lg">
                          {transaction.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            transaction.status === "COMPLETED"
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : transaction.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                              : "bg-red-100 text-red-700 border border-red-300"
                          )}
                        >
                          {transaction.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 break-words">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>📅</span>
                        {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={cn(
                        "text-2xl font-bold",
                        isCredit ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {isCredit ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Transactions</h3>
            <p className="text-muted-foreground">
              {filter === "all" ? "You don't have any transactions yet" : "No transactions matching the selected filter"}
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

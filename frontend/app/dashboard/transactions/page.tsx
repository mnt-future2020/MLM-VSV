"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, Search, Filter, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageContainer, PageHeader, StatsCard } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Transaction = {
  id: string;
  date: string;
  type: "Credit" | "Debit";
  description: string;
  amount: number;
  category: string;
  status: "Completed" | "Pending" | "Failed" | "Credited";
};

const transactions: Transaction[] = [
  { id: "TXN001", date: "2025-11-20", type: "Credit", description: "Binary Matching Bonus", amount: 500, category: "Earnings", status: "Credited" },
  { id: "TXN002", date: "2025-11-19", type: "Debit", description: "Withdrawal Request", amount: 2000, category: "Withdrawal", status: "Pending" },
  { id: "TXN003", date: "2025-11-18", type: "Credit", description: "Direct Referral Bonus", amount: 100, category: "Earnings", status: "Credited" },
  { id: "TXN004", date: "2025-11-15", type: "Debit", description: "Top Up - Professional Plan", amount: 1000, category: "Purchase", status: "Completed" },
  { id: "TXN005", date: "2025-11-10", type: "Credit", description: "Level Income", amount: 50, category: "Earnings", status: "Credited" },
];

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("2025-11");

  return (
    <PageContainer maxWidth="2xl">
      <PageHeader
        icon={<ArrowUpRight className="w-6 h-6 text-white" />}
        title="Transaction History"
        subtitle="View and manage your financial transactions"
        action={
          <Button variant="outline" className="gap-2 border-border hover:bg-muted">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard
          label="Total Earnings"
          value="₹12,450"
          icon={<ArrowUpRight className="w-6 h-6 text-green-600" />}
          gradient="bg-green-500"
          trend={{ value: "+12.5%", isPositive: true }}
        />
        <StatsCard
          label="Total Spent"
          value="₹3,500"
          icon={<ArrowDownLeft className="w-6 h-6 text-red-600" />}
          gradient="bg-red-500"
        />
        <StatsCard
          label="Total Withdrawn"
          value="₹8,000"
          icon={<Filter className="w-6 h-6 text-blue-600" />}
          gradient="bg-blue-500"
        />
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Transactions</SelectItem>
              <SelectItem value="Credit">Credit Only</SelectItem>
              <SelectItem value="Debit">Debit Only</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Transaction ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Date</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Type</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Description</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Amount</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Category</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr
                  key={txn.id}
                  className={cn(
                    "border-b border-border hover:bg-muted/50 transition-colors",
                    index === transactions.length - 1 && "border-0"
                  )}
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{txn.id}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{txn.date}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                      txn.type === "Credit" 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-red-50 text-red-700 border-red-200"
                    )}>
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{txn.description}</td>
                  <td className={cn(
                    "px-6 py-4 text-sm font-semibold",
                    txn.type === "Credit" ? "text-green-600" : "text-red-600"
                  )}>
                    {txn.type === "Credit" ? "+" : "-"}₹{txn.amount}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{txn.category}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                      txn.status === "Completed" || txn.status === "Credited"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : txn.status === "Pending"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    )}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Showing 1 to 5 of 24 entries
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="default" size="sm" className="bg-primary-500 hover:bg-primary-600 text-white">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

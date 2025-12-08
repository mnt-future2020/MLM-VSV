"use client";

import { useState } from "react";
import { FileText, DollarSign, AlertCircle, Clock, Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageContainer, PageHeader, StatsCard } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WithdrawalRequest = {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: "Completed" | "Processing" | "Pending";
  processedDate?: string;
};

const withdrawalHistory: WithdrawalRequest[] = [
  { id: "WD001", date: "2025-11-20", amount: 10000, method: "Bank Transfer", status: "Completed", processedDate: "2025-11-22" },
  { id: "WD002", date: "2025-11-15", amount: 5000, method: "UPI", status: "Completed", processedDate: "2025-11-16" },
  { id: "WD003", date: "2025-11-10", amount: 7500, method: "Bank Transfer", status: "Processing" },
  { id: "WD004", date: "2025-11-05", amount: 12000, method: "Bank Transfer", status: "Completed", processedDate: "2025-11-07" },
];

export default function PayoutReportsPage() {
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [remarks, setRemarks] = useState("");

  const availableBalance = 42500;
  const pendingWithdrawals = 7500;
  const totalWithdrawn = 82000;
  const maxWithdrawal = 42500;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Withdrawal request:", { withdrawalAmount, paymentMethod, remarks });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-700 bg-green-50 border-green-200";
      case "Processing":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "Pending":
        return "text-orange-700 bg-orange-50 border-orange-200";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        icon={<FileText className="w-6 h-6 text-white" />}
        title="Payout Reports"
        subtitle="Request withdrawals and view payout history"
      />

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard
          label="Available Balance"
          value={`₹${availableBalance.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          gradient="bg-gradient-to-br from-green-500 to-emerald-600 text-white"
          className="bg-green-600 border-green-500 text-white"
        />
        <StatsCard
          label="Pending Withdrawals"
          value={`₹${pendingWithdrawals.toLocaleString()}`}
          icon={<Clock className="w-6 h-6 text-orange-600" />}
          gradient="bg-orange-500"
        />
        <StatsCard
          label="Total Withdrawn"
          value={`₹${totalWithdrawn.toLocaleString()}`}
          icon={<Receipt className="w-6 h-6 text-purple-600" />}
          gradient="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Withdrawal Request Form */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Request Withdrawal</h2>

            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 space-y-1">
                <p className="font-semibold">Important Notice:</p>
                <ul className="list-disc list-inside space-y-1 text-xs opacity-90">
                  <li>Minimum withdrawal amount is ₹1,000</li>
                  <li>Processing time: 3-5 business days</li>
                  <li>Ensure your bank details are up to date</li>
                </ul>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label required>Withdrawal Amount</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Available: ₹{maxWithdrawal.toLocaleString()}
                </p>
              </div>

              <div>
                <Label required>Payment Method</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Remarks (Optional)</Label>
                <Textarea
                  placeholder="Add any additional notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className="min-h-[80px]"
                />
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-6 shadow-lg shadow-primary-500/20"
                >
                  Submit Request
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setWithdrawalAmount("");
                    setRemarks("");
                  }}
                  className="w-full border-border hover:bg-muted"
                >
                  Reset
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border bg-muted/30">
              <h2 className="text-lg font-semibold text-foreground">Withdrawal History</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">ID</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Date</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Amount</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Method</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Processed</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawalHistory.map((request, index) => (
                    <tr
                      key={request.id}
                      className={cn(
                        "border-b border-border hover:bg-muted/50 transition-colors",
                        index === withdrawalHistory.length - 1 && "border-0"
                      )}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{request.id}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{request.date}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">
                        ₹{request.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{request.method}</td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(request.status))}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {request.processedDate || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

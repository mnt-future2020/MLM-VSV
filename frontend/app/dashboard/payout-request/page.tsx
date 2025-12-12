"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  DollarSign,
  AlertCircle,
  Clock,
  Receipt,
} from "lucide-react";
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
import {
  PageContainer,
  PageHeader,
  StatsCard,
} from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { axiosInstance } from "@/lib/api";

type WithdrawalRequest = {
  id: string;
  createdAt: string;
  amount: number;
  paymentMethod?: string;
  status: string;
  approvedAt?: string;
};

export default function PayoutReportsPage() {
  const { user } = useAuth();
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [remarks, setRemarks] = useState("");
  const [withdrawalHistory, setWithdrawalHistory] = useState<
    WithdrawalRequest[]
  >([]);
  const [walletData, setWalletData] = useState({
    balance: 0,
    totalWithdrawals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [minWithdrawal, setMinWithdrawal] = useState(1000);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch wallet balance
        const walletRes = await axiosInstance.get("/api/wallet/balance");
        if (walletRes.data.success) {
          setWalletData(walletRes.data.data);
        }

        // Fetch withdrawal history
        const historyRes = await axiosInstance.get("/api/withdrawal/history");
        if (historyRes.data.success) {
          setWithdrawalHistory(historyRes.data.data || []);
        }

        // Fetch settings for minimum withdrawal
        const settingsRes = await axiosInstance.get("/api/settings/public");
        if (
          settingsRes.data.success &&
          settingsRes.data.data?.minimumWithdrawLimit
        ) {
          setMinWithdrawal(Number(settingsRes.data.data.minimumWithdrawLimit));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const pendingWithdrawals = withdrawalHistory
    .filter((w) => w.status === "PENDING")
    .reduce((sum, w) => sum + w.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalAmount || parseFloat(withdrawalAmount) < minWithdrawal) {
      alert(`Minimum withdrawal amount is ₹${minWithdrawal.toLocaleString()}`);
      return;
    }

    try {
      setSubmitting(true);
      const response = await axiosInstance.post("/api/withdrawal/request", {
        amount: parseFloat(withdrawalAmount),
        paymentMethod,
        remarks,
      });

      if (response.data.success) {
        alert("Withdrawal request submitted successfully!");
        setWithdrawalAmount("");
        setRemarks("");

        // Refresh data
        const historyRes = await axiosInstance.get("/api/withdrawal/history");
        if (historyRes.data.success) {
          setWithdrawalHistory(historyRes.data.data || []);
        }

        const walletRes = await axiosInstance.get("/api/wallet/balance");
        if (walletRes.data.success) {
          setWalletData(walletRes.data.data);
        }
      }
    } catch (error: any) {
      console.error("Error submitting withdrawal:", error);
      alert(
        error.response?.data?.detail || "Failed to submit withdrawal request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return "text-green-700 bg-green-50 border-green-200";
      case "PROCESSING":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "PENDING":
        return "text-orange-700 bg-orange-50 border-orange-200";
      case "REJECTED":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  if (loading) {
    return (
      <PageContainer maxWidth="xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        icon={<FileText className="w-6 h-6 text-white" />}
        title="Payout Request"
        subtitle="Request withdrawals and view payout history"
      />

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard
          label="Available Balance"
          value={`₹${walletData.balance.toLocaleString()}`}
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
          value={`₹${walletData.totalWithdrawals.toLocaleString()}`}
          icon={<Receipt className="w-6 h-6 text-purple-600" />}
          gradient="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Withdrawal Request Form */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Request Withdrawal
            </h2>

            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 space-y-1">
                <p className="font-semibold">Important Notice:</p>
                <ul className="list-disc list-inside space-y-1 text-xs opacity-90">
                  <li>
                    Minimum withdrawal amount is ₹
                    {minWithdrawal.toLocaleString()}
                  </li>
                  <li>Processing time: 3-5 business days</li>
                  <li>Ensure your bank details are up to date</li>
                </ul>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label required>Withdrawal Amount</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="pl-8"
                    min={minWithdrawal}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Available: ₹{walletData.balance.toLocaleString()}
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
                  disabled={submitting}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-6 shadow-lg shadow-primary-500/20"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
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
              <h2 className="text-lg font-semibold text-foreground">
                Withdrawal History
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">
                      Method
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">
                      Processed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawalHistory.length > 0 ? (
                    withdrawalHistory.map((request, index) => (
                      <tr
                        key={request.id}
                        className={cn(
                          "border-b border-border hover:bg-muted/50 transition-colors",
                          index === withdrawalHistory.length - 1 && "border-0"
                        )}
                      >
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-foreground">
                          ₹{request.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {request.paymentMethod || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                              getStatusColor(request.status)
                            )}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {request.approvedAt
                            ? new Date(request.approvedAt).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-muted-foreground"
                      >
                        No withdrawal history
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

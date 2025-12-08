"use client";

import { useState, useEffect } from "react";
import { DollarSign, Check, X, Filter } from "lucide-react";
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

interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  bankDetails: any;
  status: string;
  requestedAt: string;
  userName: string;
  userEmail: string;
  userMobile: string;
}

export default function AdminWithdrawalsPage() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    try {
      const response = await axiosInstance.get(`/api/admin/withdrawals?status=${filter}`);
      if (response.data.success) {
        setWithdrawals(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchWithdrawals();
    }
  }, [user, filter]);

  const handleApprove = async (withdrawalId: string) => {
    setProcessing(withdrawalId);
    try {
      await axiosInstance.put(`/api/admin/withdrawals/${withdrawalId}/approve`);
      await fetchWithdrawals();
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      alert("Failed to approve withdrawal");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (withdrawalId: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    setProcessing(withdrawalId);
    try {
      await axiosInstance.put(`/api/admin/withdrawals/${withdrawalId}/reject`, { reason });
      await fetchWithdrawals();
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      alert("Failed to reject withdrawal");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="full">
      <PageHeader
        icon={<DollarSign className="w-6 h-6 text-white" />}
        title="Withdrawal Management"
        subtitle="Approve or reject withdrawal requests"
      />

      {/* Filter */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 flex items-center gap-4">
        <Filter className="w-5 h-5 text-muted-foreground" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto text-sm text-muted-foreground">
          {withdrawals.length} withdrawals
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Bank Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Requested</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {withdrawals.length > 0 ? (
                withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{w.userName}</p>
                        <p className="text-xs text-muted-foreground">{w.userEmail}</p>
                        <p className="text-xs text-muted-foreground">{w.userMobile}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-lg font-bold text-foreground">₹{w.amount}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-muted-foreground">
                        {w.bankDetails ? (
                          <div>
                            <p>A/C: {w.bankDetails.accountNumber || 'N/A'}</p>
                            <p>IFSC: {w.bankDetails.ifscCode || 'N/A'}</p>
                          </div>
                        ) : 'No details'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {new Date(w.requestedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex px-3 py-1 rounded-full text-xs font-medium",
                        w.status === "APPROVED" ? "bg-green-50 text-green-700 border border-green-200" :
                        w.status === "REJECTED" ? "bg-red-50 text-red-700 border border-red-200" :
                        "bg-yellow-50 text-yellow-700 border border-yellow-200"
                      )}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {w.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(w.id)}
                            disabled={processing === w.id}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(w.id)}
                            disabled={processing === w.id}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No withdrawals found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}

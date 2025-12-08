"use client";

import { useState, useEffect } from "react";
import { DollarSign, CheckCircle, XCircle, Clock, Search, FileText, Download } from "lucide-react";
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
import { axiosInstance } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

type PayoutRequest = {
  id: string;
  userId: string;
  userName?: string;
  amount: number;
  requestedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
};

export default function PayoutManagementPage() {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);

  const fetchPayouts = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/withdrawals', {
        params: { status: statusFilter !== "ALL" ? statusFilter : undefined }
      });
      if (response.data.success) {
        setPayouts(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedRequest(response.data.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching payouts:", error);
      toast.error("Failed to fetch withdrawal requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchPayouts();
    }
  }, [user, statusFilter]);

  const handleApprove = async (requestId: string) => {
    try {
      const response = await axiosInstance.put(`/api/admin/withdrawals/${requestId}/approve`);
      if (response.data.success) {
        toast.success("Withdrawal approved successfully");
        fetchPayouts();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve withdrawal");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const response = await axiosInstance.put(`/api/admin/withdrawals/${requestId}/reject`, {
        reason: "Rejected by admin"
      });
      if (response.data.success) {
        toast.success("Withdrawal rejected");
        fetchPayouts();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject withdrawal");
    }
  };

  const pendingPayouts = payouts.filter(p => p.status === "PENDING");
  const approvedPayouts = payouts.filter(p => p.status === "APPROVED");
  const rejectedPayouts = payouts.filter(p => p.status === "REJECTED");

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
        title="Payout Management"
        subtitle="Review and process withdrawal requests"
        action={
          <Button variant="outline" className="gap-2 border-border hover:bg-muted">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Pending Requests"
          value={String(pendingPayouts.length)}
          icon={<Clock className="w-6 h-6 text-orange-600" />}
          gradient="bg-orange-500"
        />
        <StatsCard
          label="Pending Amount"
          value={`₹${pendingPayouts.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6 text-blue-600" />}
          gradient="bg-blue-500"
        />
        <StatsCard
          label="Approved"
          value={String(approvedPayouts.length)}
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          gradient="bg-green-500"
        />
        <StatsCard
          label="Total Approved"
          value={`₹${approvedPayouts.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6 text-purple-600" />}
          gradient="bg-purple-500"
        />
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Input
              placeholder="Search by member ID or name..."
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select>
            <option value="All Payment Methods">All Payment Methods</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
          </Select>
          <Input type="date" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pending Requests List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Pending Payout Requests</h3>
          {pendingPayouts.map((req) => (
            <div
              key={req.id}
              onClick={() => setSelectedRequest(req)}
              className={cn(
                "bg-card border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md",
                selectedRequest?.id === req.id
                  ? "border-primary-500 ring-1 ring-primary-500 shadow-md"
                  : "border-border hover:border-primary-300"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-foreground">{req.memberName}</p>
                  <p className="text-xs text-muted-foreground">{req.memberId}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">₹{req.amount.toLocaleString()}</p>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                    {req.paymentMethod}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-3 space-y-1">
                <p>Date: {req.date}</p>
              </div>
              
              <div className="flex gap-2 mt-2">
                <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 h-8 text-xs">
                  <XCircle className="w-3 h-3 mr-1" /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Request Details Panel */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-fit sticky top-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Payout Details</h3>
          
          {selectedRequest ? (
            <div className="space-y-6">
              {/* Member Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Member Name:</p>
                  <p className="font-medium text-foreground">{selectedRequest.memberName}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground mb-1">Member ID:</p>
                  <p className="font-medium text-foreground">{selectedRequest.memberId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Request ID:</p>
                  <p className="font-medium text-foreground">{selectedRequest.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground mb-1">Request Date:</p>
                  <p className="font-medium text-foreground">{selectedRequest.date}</p>
                </div>
              </div>

              {/* Amount Info Card */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white text-center shadow-lg">
                <p className="text-white/80 text-sm mb-1">Requested Amount</p>
                <p className="text-4xl font-extrabold">₹{selectedRequest.amount.toLocaleString()}</p>
                <p className="text-white/80 text-xs mt-2">Available Balance: ₹1,500</p>
              </div>

              {/* Payment Details */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium text-foreground">{selectedRequest.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Account Details:</span>
                  <span className="font-mono text-foreground text-right">{selectedRequest.accountDetails}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bank Name:</span>
                  <span className="font-medium text-foreground">Example Bank</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Button className="bg-green-600 hover:bg-green-700 text-white shadow-md">
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve & Process
                </Button>
                <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white shadow-md">
                  <XCircle className="w-4 h-4 mr-2" /> Reject Request
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Select a request to view details
            </div>
          )}
        </div>
      </div>

      {/* Recently Processed Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-foreground">Recently Processed Payouts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Request ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Member ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Member Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Payment Method</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Processed Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {processedPayouts.map((payout, index) => (
                <tr
                  key={payout.id}
                  className={cn(
                    "border-b border-border hover:bg-muted/50 transition-colors",
                    index === processedPayouts.length - 1 && "border-0"
                  )}
                >
                  <td className="px-6 py-3 text-sm font-medium text-foreground">{payout.id}</td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">{payout.memberId}</td>
                  <td className="px-6 py-3 text-sm text-foreground">{payout.memberName}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-foreground">₹{payout.amount.toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">{payout.paymentMethod}</td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">{payout.date}</td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      Approved
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}

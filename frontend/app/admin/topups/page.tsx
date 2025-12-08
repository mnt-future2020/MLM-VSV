"use client";

import { useState, useEffect } from "react";
import { CreditCard, CheckCircle, XCircle, Clock, DollarSign, Search, FileText } from "lucide-react";
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

type TopupRequest = {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  referralId?: string;
  planId: string;
  planName?: string;
  amount: number;
  paymentMode: string;
  transactionId: string;
  paymentProof?: string;
  requestedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
};

export default function ManageTopupsPage() {
  const { user } = useAuth();
  const [topups, setTopups] = useState<TopupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [selectedRequest, setSelectedRequest] = useState<TopupRequest | null>(null);

  const fetchTopups = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/topups', {
        params: { status: statusFilter !== "ALL" ? statusFilter : undefined }
      });
      if (response.data.success) {
        setTopups(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedRequest(response.data.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching topups:", error);
      toast.error("Failed to fetch topup requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchTopups();
    }
  }, [user, statusFilter]);

  const handleApprove = async (topupId: string) => {
    try {
      const response = await axiosInstance.post(`/api/admin/topups/${topupId}/approve`);
      if (response.data.success) {
        toast.success("Topup approved successfully");
        fetchTopups();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve topup");
    }
  };

  const handleReject = async (topupId: string) => {
    try {
      const response = await axiosInstance.post(`/api/admin/topups/${topupId}/reject`, {
        reason: "Rejected by admin"
      });
      if (response.data.success) {
        toast.success("Topup rejected");
        fetchTopups();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject topup");
    }
  };

  const pendingTopups = topups.filter(t => t.status === "PENDING");
  const approvedTopups = topups.filter(t => t.status === "APPROVED");
  const rejectedTopups = topups.filter(t => t.status === "REJECTED");

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
        icon={<CreditCard className="w-6 h-6 text-white" />}
        title="Manage Top-ups"
        subtitle="Review and approve top-up requests"
        action={
          <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium border border-orange-200 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            5 Pending
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Pending Requests"
          value="5"
          icon={<Clock className="w-6 h-6 text-orange-600" />}
          gradient="bg-orange-500"
        />
        <StatsCard
          label="Pending Amount"
          value="₹1,00,000"
          icon={<DollarSign className="w-6 h-6 text-blue-600" />}
          gradient="bg-blue-500"
        />
        <StatsCard
          label="Approved Today"
          value="12"
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          gradient="bg-green-500"
        />
        <StatsCard
          label="Total Today"
          value="₹2,45,000"
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
            <option value="All Packages">All Packages</option>
            <option value="Starter">Starter</option>
            <option value="Professional">Professional</option>
            <option value="Business">Business</option>
          </Select>
          <Select>
            <option value="All Payment Modes">All Payment Modes</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pending Requests List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Pending Top-up Requests</h3>
          {pendingRequests.map((req) => (
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
                    {req.package}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-3 space-y-1">
                <p>Payment: {req.paymentMode}</p>
                <p>TXN ID: {req.txnId}</p>
                <p>{req.date}</p>
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
          <h3 className="text-lg font-semibold text-foreground mb-6">Top-up Details</h3>
          
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

              {/* Package Info Card */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white text-center shadow-lg">
                <p className="text-white/80 text-sm mb-1">Selected Package</p>
                <h2 className="text-2xl font-bold mb-1">{selectedRequest.package}</h2>
                <p className="text-3xl font-extrabold">₹{selectedRequest.amount.toLocaleString()}</p>
              </div>

              {/* Payment Details */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Mode:</span>
                  <span className="font-medium text-foreground">{selectedRequest.paymentMode}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-foreground">{selectedRequest.txnId}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Proof Attached:</span>
                  {selectedRequest.proofUrl ? (
                    <button className="text-primary-600 hover:underline flex items-center gap-1 text-xs">
                      <FileText className="w-3 h-3" /> View Receipt
                    </button>
                  ) : (
                    <span className="text-muted-foreground italic text-xs">No proof attached</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Button className="bg-green-600 hover:bg-green-700 text-white shadow-md">
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve Topup
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

      {/* Recently Approved Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-foreground">Recently Approved Top-ups</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Request ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Member ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Member Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Package</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Approved Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {approvedTopups.map((topup, index) => (
                <tr
                  key={topup.id}
                  className={cn(
                    "border-b border-border hover:bg-muted/50 transition-colors",
                    index === approvedTopups.length - 1 && "border-0"
                  )}
                >
                  <td className="px-6 py-3 text-sm font-medium text-foreground">{topup.id}</td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">{topup.memberId}</td>
                  <td className="px-6 py-3 text-sm text-foreground">{topup.memberName}</td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">{topup.package}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-foreground">₹{topup.amount.toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">{topup.date}</td>
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

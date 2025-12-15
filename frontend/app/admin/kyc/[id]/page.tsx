"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  FileImage
} from "lucide-react";

interface KYCDetail {
  id: string;
  userId: string;
  form: {
    name: string;
    email: string;
    phone: string;
    address: string;
    dob: string;
    idNumber: string;
    sponsorReferralId: string;
    bank: {
      accountName: string;
      accountNumber: string;
      ifsc: string;
      bankName: string;
    };
  };
  idProofBase64: string;
  status: string;
  remarks?: string;
  submittedBy: { userId: string; role: string };
  createdAt: string;
  user: {
    id: string;
    name: string;
    referralId: string;
    mobile: string;
    email: string;
  };
}

export default function KYCDetailPage() {
  const params = useParams();
  const router = useRouter();
  const kycId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [kycDetail, setKycDetail] = useState<KYCDetail | null>(null);
  const [processing, setProcessing] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    fetchKYCDetail();
  }, [kycId]);

  const fetchKYCDetail = async () => {
    try {
      const response = await axiosInstance.get(`/api/admin/kyc/${kycId}`);
      if (response.data?.success) {
        setKycDetail(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching KYC detail:", error);
      toast.error("Failed to load KYC details");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const response = await axiosInstance.post("/api/admin/kyc/approve", {
        kycId,
        remarks
      });
      if (response.data?.success) {
        toast.success(response.data.message || "KYC approved successfully!");
        router.push("/admin/kyc");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to approve KYC");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    setProcessing(true);
    try {
      const response = await axiosInstance.post("/api/admin/kyc/reject", {
        kycId,
        remarks
      });
      if (response.data?.success) {
        toast.success(response.data.message || "KYC rejected");
        router.push("/admin/kyc");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to reject KYC");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return (
          <span className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-sm font-medium">
            <Clock className="w-4 h-4" /> Pending Review
          </span>
        );
      case "APPROVED":
        return (
          <span className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium">
            <XCircle className="w-4 h-4" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!kycDetail) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">KYC submission not found</p>
        <Button className="mt-4" onClick={() => router.push("/admin/kyc")}>
          Back to KYC List
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6" data-testid="admin-kyc-detail">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/admin/kyc")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>
        {getStatusBadge(kycDetail.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Information
            </CardTitle>
            <CardDescription>
              Referral ID: {kycDetail.user?.referralId || 'N/A'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{kycDetail.form.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{kycDetail.form.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{kycDetail.form.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{kycDetail.form.dob}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{kycDetail.form.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">PAN/Aadhaar Number</p>
                <p className="font-medium font-mono">{kycDetail.form.idNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details & ID Proof */}
        <div className="space-y-6">
          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {kycDetail.form.bank?.accountName ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Account Name</p>
                      <p className="font-medium">{kycDetail.form.bank.accountName || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Bank Name</p>
                      <p className="font-medium">{kycDetail.form.bank.bankName || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Account Number</p>
                      <p className="font-medium font-mono">{kycDetail.form.bank.accountNumber || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">IFSC Code</p>
                      <p className="font-medium font-mono">{kycDetail.form.bank.ifsc || 'N/A'}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">No bank details provided</p>
              )}
            </CardContent>
          </Card>

          {/* ID Proof */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="w-5 h-5" />
                ID Proof Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              {kycDetail.idProofBase64 ? (
                <div className="border rounded-lg p-2">
                  <img
                    src={kycDetail.idProofBase64}
                    alt="ID Proof"
                    className="w-full rounded"
                  />
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No ID proof uploaded</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      {kycDetail.status === "SUBMITTED" && (
        <Card>
          <CardHeader>
            <CardTitle>Review Actions</CardTitle>
            <CardDescription>Approve or reject this KYC submission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {showRejectForm ? (
              <div className="space-y-4">
                <div>
                  <Label>Rejection Reason *</Label>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Please provide a clear reason for rejection..."
                    rows={3}
                    data-testid="rejection-remarks"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectForm(false);
                      setRemarks("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={processing || !remarks.trim()}
                  >
                    {processing ? "Rejecting..." : "Confirm Rejection"}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <Label>Remarks (Optional)</Label>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add any remarks or notes..."
                    rows={2}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleApprove}
                    disabled={processing}
                    data-testid="approve-btn"
                  >
                    {processing ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Approve KYC
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowRejectForm(true)}
                    disabled={processing}
                    data-testid="reject-btn"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject KYC
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Previous Remarks */}
      {kycDetail.remarks && (
        <Card className={kycDetail.status === "REJECTED" ? "border-red-200" : "border-green-200"}>
          <CardContent className="p-4">
            <p className={`font-medium ${kycDetail.status === "REJECTED" ? "text-red-600" : "text-green-600"}`}>
              Admin Remarks:
            </p>
            <p className="text-gray-700 mt-1">{kycDetail.remarks}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

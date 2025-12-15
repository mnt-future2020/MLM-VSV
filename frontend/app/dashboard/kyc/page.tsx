"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { axiosInstance } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, CheckCircle2, XCircle, Clock, AlertCircle, FileImage } from "lucide-react";

interface KYCData {
  kycStatus: string;
  isActive: boolean;
  submission: {
    id: string;
    form: any;
    status: string;
    remarks?: string;
    createdAt: string;
  } | null;
}

export default function KYCPage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    idNumber: "",
    bank: {
      accountName: "",
      accountNumber: "",
      ifsc: "",
      bankName: ""
    },
    idProofBase64: ""
  });
  
  const [idProofPreview, setIdProofPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.mobile || ""
      }));
    }
  }, [user]);

  const fetchKYCStatus = async () => {
    try {
      const response = await axiosInstance.get("/api/kyc/me");
      if (response.data?.success) {
        setKycData(response.data.data);
        
        // Pre-fill form if there's a previous submission
        if (response.data.data?.submission?.form) {
          const form = response.data.data.submission.form;
          setFormData({
            name: form.name || "",
            email: form.email || "",
            phone: form.phone || "",
            address: form.address || "",
            dob: form.dob || "",
            idNumber: form.idNumber || "",
            bank: form.bank || { accountName: "", accountNumber: "", ifsc: "", bankName: "" },
            idProofBase64: ""
          });
        }
      }
    } catch (error) {
      console.error("Error fetching KYC status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
      setFileError("Only JPEG images are allowed");
      return;
    }
    
    // Validate file size (500KB = 512000 bytes)
    const sizeKB = file.size / 1024;
    setFileSize(sizeKB);
    
    if (sizeKB > 500) {
      setFileError(`File size must be under 500KB. Current size: ${sizeKB.toFixed(1)}KB`);
      return;
    }
    
    // Read file and convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setIdProofPreview(base64);
      setFormData(prev => ({ ...prev, idProofBase64: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.idProofBase64) {
      toast.error("Please upload your ID proof");
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await axiosInstance.post("/api/kyc/submit", formData);
      if (response.data?.success) {
        toast.success(response.data.message || "KYC submitted successfully!");
        await fetchKYCStatus();
        await refreshUser();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to submit KYC");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_KYC":
        return (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>KYC Pending - Please complete your KYC</span>
          </div>
        );
      case "KYC_SUBMITTED":
        return (
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5" />
            <span>KYC Submitted - Waiting for admin approval</span>
          </div>
        );
      case "KYC_REJECTED":
        return (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
            <XCircle className="w-5 h-5" />
            <span>KYC Rejected - Please resubmit</span>
          </div>
        );
      case "ACTIVE":
        return (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
            <span>KYC Approved - Account Active</span>
          </div>
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

  // If KYC is approved, show success state
  if (kycData?.kycStatus === "ACTIVE") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              KYC Verified
            </CardTitle>
            <CardDescription>Your KYC has been approved and your account is now active.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700">You now have full access to all features of the platform.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If KYC is submitted and pending
  if (kycData?.kycStatus === "KYC_SUBMITTED") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Clock className="w-6 h-6" />
              KYC Under Review
            </CardTitle>
            <CardDescription>Your KYC submission is being reviewed by the admin.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700">Please wait while we verify your documents. This usually takes 24-48 hours.</p>
            </div>
            {kycData.submission && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">Submitted on: {new Date(kycData.submission.createdAt).toLocaleDateString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show KYC form for PENDING_KYC or KYC_REJECTED
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your KYC</CardTitle>
          <CardDescription>
            Please fill in your details and upload your ID proof to activate your account.
          </CardDescription>
          <div className="mt-4">
            {renderStatusBadge(kycData?.kycStatus || "PENDING_KYC")}
          </div>
          {kycData?.kycStatus === "KYC_REJECTED" && kycData.submission?.remarks && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">Rejection Reason:</p>
              <p className="text-red-600">{kycData.submission.remarks}</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="kyc-form">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    data-testid="kyc-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    data-testid="kyc-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    data-testid="kyc-phone-input"
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                    required
                    data-testid="kyc-dob-input"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Full Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  required
                  rows={3}
                  data-testid="kyc-address-input"
                />
              </div>
            </div>

            {/* ID Proof */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Identity Verification</h3>
              <div>
                <Label htmlFor="idNumber">PAN / Aadhaar Number *</Label>
                <Input
                  id="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                  placeholder="Enter your PAN or Aadhaar number"
                  required
                  data-testid="kyc-id-number-input"
                />
              </div>
              <div>
                <Label>ID Proof Document (JPEG only, max 500KB) *</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                    data-testid="id-proof-input"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                      ${fileError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
                  >
                    {idProofPreview ? (
                      <div className="space-y-2">
                        <img src={idProofPreview} alt="ID Preview" className="max-h-40 mx-auto rounded" />
                        <p className="text-sm text-gray-600">Size: {fileSize.toFixed(1)}KB</p>
                        <p className="text-sm text-blue-600">Click to change</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FileImage className="w-12 h-12 mx-auto text-gray-400" />
                        <p className="text-gray-600">Click to upload JPEG image</p>
                        <p className="text-sm text-gray-400">Maximum size: 500KB</p>
                      </div>
                    )}
                  </div>
                  {fileError && (
                    <p className="mt-2 text-sm text-red-600">{fileError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountName">Account Holder Name</Label>
                  <Input
                    id="accountName"
                    value={formData.bank.accountName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      bank: { ...prev.bank, accountName: e.target.value }
                    }))}
                    data-testid="kyc-account-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.bank.accountNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      bank: { ...prev.bank, accountNumber: e.target.value }
                    }))}
                    data-testid="kyc-account-number-input"
                  />
                </div>
                <div>
                  <Label htmlFor="ifsc">IFSC Code</Label>
                  <Input
                    id="ifsc"
                    value={formData.bank.ifsc}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      bank: { ...prev.bank, ifsc: e.target.value }
                    }))}
                    data-testid="kyc-ifsc-input"
                  />
                </div>
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bank.bankName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      bank: { ...prev.bank, bankName: e.target.value }
                    }))}
                    data-testid="kyc-bank-name-input"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || !!fileError || !formData.idProofBase64}
              data-testid="kyc-submit-btn"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Submit KYC
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

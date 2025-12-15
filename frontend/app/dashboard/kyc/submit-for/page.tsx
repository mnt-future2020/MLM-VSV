"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { axiosInstance } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Search, Upload, FileImage, User, CheckCircle2 } from "lucide-react";

interface MemberData {
  id: string;
  name: string;
  referralId: string;
  mobile: string;
  email: string;
  kycStatus: string;
}

export default function SubmitKYCForPage() {
  const { user } = useAuth();
  const [searchId, setSearchId] = useState("");
  const [searching, setSearching] = useState(false);
  const [member, setMember] = useState<MemberData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

  const handleSearch = async () => {
    if (!searchId.trim()) {
      toast.error("Please enter a Referral ID");
      return;
    }
    
    setSearching(true);
    setMember(null);
    
    try {
      // First lookup the referral ID
      const lookupResponse = await axiosInstance.post("/api/auth/lookup-referral", {
        referralId: searchId.trim()
      });
      
      if (!lookupResponse.data?.success) {
        toast.error("Member not found with this Referral ID");
        return;
      }
      
      // Get pending members to verify this is a direct downline
      const pendingResponse = await axiosInstance.get("/api/kyc/pending-members");
      
      if (pendingResponse.data?.success) {
        const foundMember = pendingResponse.data.data.find(
          (m: MemberData) => m.referralId === searchId.trim()
        );
        
        if (foundMember) {
          setMember(foundMember);
          setFormData(prev => ({
            ...prev,
            name: foundMember.name || "",
            email: foundMember.email || "",
            phone: foundMember.mobile || ""
          }));
        } else {
          toast.error("This member is not your direct downline or KYC is already submitted/approved");
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to search member");
    } finally {
      setSearching(false);
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
    
    // Validate file size
    const sizeKB = file.size / 1024;
    setFileSize(sizeKB);
    
    if (sizeKB > 500) {
      setFileError(`File size must be under 500KB. Current size: ${sizeKB.toFixed(1)}KB`);
      return;
    }
    
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
    
    if (!member) {
      toast.error("Please search and select a member first");
      return;
    }
    
    if (!formData.idProofBase64) {
      toast.error("Please upload ID proof");
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await axiosInstance.post("/api/kyc/submit-for", {
        targetReferralId: member.referralId,
        ...formData
      });
      
      if (response.data?.success) {
        toast.success(response.data.message || "KYC submitted successfully!");
        setSubmitted(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to submit KYC");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              KYC Submitted Successfully
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700">KYC for {member?.name} has been submitted and is pending admin approval.</p>
            </div>
            <Button
              className="mt-4"
              onClick={() => {
                setSubmitted(false);
                setMember(null);
                setSearchId("");
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  address: "",
                  dob: "",
                  idNumber: "",
                  bank: { accountName: "", accountNumber: "", ifsc: "", bankName: "" },
                  idProofBase64: ""
                });
                setIdProofPreview(null);
              }}
            >
              Submit Another KYC
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Search Card */}
      <Card>
        <CardHeader>
          <CardTitle>Submit KYC for Team Member</CardTitle>
          <CardDescription>Search for your direct downline member by their Referral ID to submit KYC on their behalf.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter Referral ID (e.g., VSV123ABC)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.toUpperCase())}
              className="flex-1"
              data-testid="referral-search"
            />
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Searching...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </span>
              )}
            </Button>
          </div>
          
          {member && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{member.name}</p>
                  <p className="text-sm text-gray-600">Referral ID: {member.referralId}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* KYC Form */}
      {member && (
        <Card>
          <CardHeader>
            <CardTitle>KYC Details for {member.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="kyc-submit-for-form">
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      required
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
                    required
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
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitting || !!fileError || !formData.idProofBase64}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Submit KYC for {member.name}
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

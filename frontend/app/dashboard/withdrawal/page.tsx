"use client";

import { useState, useEffect } from "react";
import { DollarSign, ArrowLeft } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { axiosInstance } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WithdrawalRequestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [minimumLimit, setMinimumLimit] = useState(1000);
  const [formData, setFormData] = useState({
    amount: "",
    accountNumber: "",
    accountHolderName: "",
    ifscCode: "",
    bankName: "",
    branch: ""
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axiosInstance.get('/api/settings/public');
        if (response.data.success && response.data.data) {
          const limit = parseInt(response.data.data.minimumWithdrawLimit || "1000");
          setMinimumLimit(limit);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/withdrawal/request', {
        amount: parseFloat(formData.amount),
        bankDetails: {
          accountNumber: formData.accountNumber,
          accountHolderName: formData.accountHolderName,
          ifscCode: formData.ifscCode,
          bankName: formData.bankName,
          branch: formData.branch
        }
      });

      if (response.data.success) {
        alert('Withdrawal request submitted successfully!');
        router.push('/dashboard/wallet');
      }
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="2xl">
      <PageHeader
        icon={<DollarSign className="w-6 h-6 text-white" />}
        title="Request Withdrawal"
        subtitle="Withdraw your earnings to your bank account"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <Label htmlFor="amount">Withdrawal Amount *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
                min={minimumLimit}
                step="0.01"
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum withdrawal: ₹{minimumLimit}</p>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Bank Details</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                  <Input
                    id="accountHolderName"
                    type="text"
                    placeholder="As per bank account"
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData({...formData, accountHolderName: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    type="text"
                    placeholder="Enter account number"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ifscCode">IFSC Code *</Label>
                  <Input
                    id="ifscCode"
                    type="text"
                    placeholder="e.g. SBIN0001234"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    type="text"
                    placeholder="e.g. State Bank of India"
                    value={formData.bankName}
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    type="text"
                    placeholder="Branch name"
                    value={formData.branch}
                    onChange={(e) => setFormData({...formData, branch: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Link href="/dashboard/wallet" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="flex-1 bg-primary-600 hover:bg-primary-700">
                {loading ? 'Processing...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Processing Time</h4>
            <p className="text-sm text-blue-700">Withdrawal requests are processed within 24-48 hours by admin.</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">Important</h4>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Ensure bank details are correct</li>
              <li>Minimum withdrawal: ₹100</li>
              <li>Amount will be deducted from wallet</li>
            </ul>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

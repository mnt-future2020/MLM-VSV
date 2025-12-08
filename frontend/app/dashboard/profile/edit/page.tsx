"use client";

import { useState } from "react";
import { Building2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";

export default function BankDetailsPage() {
  const [formData, setFormData] = useState({
    accountHolderName: "John Doe",
    accountType: "Savings Account",
    accountNumber: "123456789",
    confirmAccountNumber: "123456789",
    bankName: "Example Bank",
    branchName: "Main Branch",
    ifscCode: "BANK0001234",
    panNumber: "ABCDE1234F",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Bank details updated:", formData);
  };

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        icon={<Building2 className="w-6 h-6 text-white" />}
        title="Bank Details"
        subtitle="Update your banking information"
      />

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3 shadow-sm">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Important:</span> Please ensure all bank details are accurate. These details will be used for all withdrawal transactions.
          </p>
        </div>
      </div>

      {/* Bank Details Form */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm space-y-8">
        {/* Account Information */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label required>Account Holder Name</Label>
              <Input
                value={formData.accountHolderName}
                onChange={(e) => setFormData({...formData, accountHolderName: e.target.value})}
              />
            </div>
            <div>
              <Label required>Account Type</Label>
              <Select
                value={formData.accountType}
                onValueChange={(value) => setFormData({...formData, accountType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Savings Account">Savings Account</SelectItem>
                  <SelectItem value="Current Account">Current Account</SelectItem>
                  <SelectItem value="Salary Account">Salary Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label required>Account Number</Label>
              <Input
                value={formData.accountNumber}
                onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                type="number"
              />
            </div>
            <div>
              <Label required>Confirm Account Number</Label>
              <Input
                value={formData.confirmAccountNumber}
                onChange={(e) => setFormData({...formData, confirmAccountNumber: e.target.value})}
                type="number"
              />
            </div>
          </div>
        </div>

        {/* Bank Information */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">Bank Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label required>Bank Name</Label>
              <Input
                value={formData.bankName}
                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
              />
            </div>
            <div>
              <Label required>Branch Name</Label>
              <Input
                value={formData.branchName}
                onChange={(e) => setFormData({...formData, branchName: e.target.value})}
              />
            </div>
            <div>
              <Label required>IFSC Code</Label>
              <Input
                value={formData.ifscCode}
                onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                placeholder="e.g., BANK0001234"
              />
            </div>
            <div>
              <Label required>PAN Number</Label>
              <Input
                value={formData.panNumber}
                onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
                placeholder="e.g., ABCDE1234F"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-6 shadow-lg shadow-primary-500/20"
          >
            Update Bank Details
          </Button>
          <Button
            type="button"
            variant="outline"
            className="px-8 py-6 border-border hover:bg-muted"
          >
            Cancel
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}

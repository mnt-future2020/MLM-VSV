"use client";

import { useState } from "react";
import { UserPlus, Search } from "lucide-react";
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

export default function NewMemberPage() {
  const [formData, setFormData] = useState({
    sponsorId: "",
    sponsorName: "",
    placement: "LEFT",
    fullName: "",
    gender: "Male",
    mobile: "",
    email: "",
    password: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    panNumber: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleReset = () => {
    setFormData({
      sponsorId: "",
      sponsorName: "",
      placement: "LEFT",
      fullName: "",
      gender: "Male",
      mobile: "",
      email: "",
      password: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      branchName: "",
      panNumber: "",
    });
  };

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        icon={<UserPlus className="w-6 h-6 text-white" />}
        title="Register New Member"
        subtitle="Add a new member to your team"
      />

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm space-y-8">
        {/* Sponsor Information */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">Sponsor Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label required>Sponsor ID</Label>
              <div className="relative">
                <Input
                  placeholder="Enter sponsor ID"
                  value={formData.sponsorId}
                  onChange={(e) => setFormData({...formData, sponsorId: e.target.value})}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary-600 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <Label required>Sponsor Name</Label>
              <Input
                placeholder="Auto-filled"
                value={formData.sponsorName}
                disabled
                className="bg-muted/50"
              />
            </div>
            <div>
              <Label required>Placement</Label>
              <Select
                value={formData.placement}
                onValueChange={(value) => setFormData({...formData, placement: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select placement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LEFT">LEFT</SelectItem>
                  <SelectItem value="RIGHT">RIGHT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <Label required>Full Name</Label>
              <Input
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div>
              <Label required>Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({...formData, gender: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label required>Mobile Number</Label>
              <Input
                type="tel"
                placeholder="Enter mobile number"
                value={formData.mobile}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              />
            </div>
            <div>
              <Label required>Email ID</Label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <Label required>Password</Label>
              <Input
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Bank Information */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">Bank Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label required>Account Number</Label>
              <Input
                placeholder="Enter account number"
                value={formData.accountNumber}
                onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
              />
            </div>
            <div>
              <Label required>IFSC Code</Label>
              <Input
                placeholder="Enter IFSC code"
                value={formData.ifscCode}
                onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
              />
            </div>
            <div>
              <Label required>Bank Name</Label>
              <Input
                placeholder="Enter bank name"
                value={formData.bankName}
                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
              />
            </div>
            <div>
              <Label required>Branch Name</Label>
              <Input
                placeholder="Enter branch name"
                value={formData.branchName}
                onChange={(e) => setFormData({...formData, branchName: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <Label required>PAN Number</Label>
              <Input
                placeholder="Enter PAN number"
                value={formData.panNumber}
                onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-6 text-lg shadow-lg shadow-primary-500/20"
          >
            Register Member
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="px-8 py-6 text-lg border-border hover:bg-muted"
          >
            Reset
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}

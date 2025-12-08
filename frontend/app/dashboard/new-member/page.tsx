"use client";

import { useState } from "react";
import { UserPlus, Search, Loader2 } from "lucide-react";
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
import { axiosInstance } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

export default function NewMemberPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchingSponsor, setSearchingSponsor] = useState(false);
  const [formData, setFormData] = useState({
    sponsorId: user?.referralId || "",
    sponsorName: user?.name || "",
    placement: "LEFT",
    fullName: "",
    username: "",
    gender: "Male",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSearchSponsor = async () => {
    if (!formData.sponsorId) {
      toast.error("Please enter sponsor ID");
      return;
    }

    setSearchingSponsor(true);
    try {
      const response = await axiosInstance.get(`/api/admin/users?search=${formData.sponsorId}`);
      if (response.data.success && response.data.data.length > 0) {
        const sponsor = response.data.data[0];
        setFormData({ ...formData, sponsorName: sponsor.name });
        toast.success("Sponsor found!");
      } else {
        toast.error("Sponsor not found");
        setFormData({ ...formData, sponsorName: "" });
      }
    } catch (error) {
      toast.error("Error finding sponsor");
      setFormData({ ...formData, sponsorName: "" });
    } finally {
      setSearchingSponsor(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.sponsorId) {
      toast.error("Sponsor ID is required");
      return;
    }
    if (!formData.fullName || !formData.username || !formData.mobile || !formData.email) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/auth/register', {
        name: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile,
        referralId: formData.sponsorId,
        placement: formData.placement
      });

      if (response.data.success) {
        toast.success("Member registered successfully!");
        toast.success(`Referral ID: ${response.data.user.referralId}`, { duration: 10000 });
        handleReset();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      sponsorId: user?.referralId || "",
      sponsorName: user?.name || "",
      placement: "LEFT",
      fullName: "",
      username: "",
      gender: "Male",
      mobile: "",
      email: "",
      password: "",
      confirmPassword: "",
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
                  onClick={handleSearchSponsor}
                  disabled={searchingSponsor}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary-600 transition-colors disabled:opacity-50"
                >
                  {searchingSponsor ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
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
            <div>
              <Label required>Full Name</Label>
              <Input
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>
            <div>
              <Label required>Username</Label>
              <Input
                placeholder="Enter username (unique)"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
            <div>
              <Label required>Mobile Number</Label>
              <Input
                type="tel"
                placeholder="Enter mobile number"
                value={formData.mobile}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                required
              />
            </div>
            <div>
              <Label required>Email ID</Label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div>
              <Label required>Password</Label>
              <Input
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            <div>
              <Label required>Confirm Password</Label>
              <Input
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>
          </div>
        </div>

        {/* Remove Bank Information section as it's not required for registration */}
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

"use client";

import { useState, useEffect } from "react";
import { UserPlus, Search, Loader2, CheckCircle, Copy, X } from "lucide-react";
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

interface Plan {
  id: string;
  name: string;
  amount: number;
  isActive: boolean;
}

export default function NewMemberPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchingSponsor, setSearchingSponsor] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
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
    planId: "no-plan",
  });
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [newUserData, setNewUserData] = useState<any>(null);

  // Fetch available plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosInstance.get("/api/plans");
        if (response.data.success) {
          setPlans(response.data.data.filter((p: Plan) => p.isActive));
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    };
    fetchPlans();
  }, []);

  const handleSearchSponsor = async (sponsorIdToSearch?: string) => {
    const idToSearch = sponsorIdToSearch || formData.sponsorId;

    if (!idToSearch) {
      toast.error("Please enter sponsor ID");
      return;
    }

    setSearchingSponsor(true);
    try {
      const response = await axiosInstance.post("/api/auth/lookup-referral", {
        referralId: idToSearch,
      });

      if (response.data.success) {
        const sponsor = response.data.data;
        setFormData({ ...formData, sponsorName: sponsor.name });
        if (!sponsorIdToSearch) {
          toast.success("Sponsor found!");
        }
      } else {
        const errorMessage = response.data.message || "Sponsor not found";
        toast.error(
          typeof errorMessage === "string" ? errorMessage : "Sponsor not found"
        );
        setFormData({ ...formData, sponsorName: "" });
      }
    } catch (error) {
      toast.error("Error finding sponsor");
      setFormData({ ...formData, sponsorName: "" });
    } finally {
      setSearchingSponsor(false);
    }
  };

  // Auto-lookup sponsor when user leaves the sponsor ID field
  const handleSponsorIdBlur = () => {
    if (formData.sponsorId && formData.sponsorId.length >= 6) {
      handleSearchSponsor(formData.sponsorId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.sponsorId) {
      toast.error("Sponsor ID is required");
      return;
    }
    if (!formData.fullName || !formData.username || !formData.mobile) {
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
      const registerData: any = {
        name: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile,
        referralId: formData.sponsorId,
        placement: formData.placement,
      };

      // Add plan if selected
      if (formData.planId && formData.planId !== "no-plan") {
        registerData.planId = formData.planId;
      }

      const response = await axiosInstance.post(
        "/api/auth/register",
        registerData
      );

      if (response.data.success) {
        // Store user data and show welcome modal
        setNewUserData({
          name: formData.fullName,
          username: formData.username,
          referralId: response.data.user.referralId,
          password: formData.password,
          planName: formData.planId !== "no-plan" ? plans.find(p => p.id === formData.planId)?.name : null
        });
        setShowWelcomeModal(true);
        handleReset();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Registration failed";
      toast.error(
        typeof errorMessage === "string" ? errorMessage : "Registration failed"
      );
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
      planId: "no-plan",
    });
  };


  const [placementPreview, setPlacementPreview] = useState<any>(null);

  // Preview placement when sponsor or placement changes
  useEffect(() => {
    const fetchPlacementPreview = async () => {
      if (!formData.sponsorId || formData.sponsorId.length < 3) {
        setPlacementPreview(null);
        return;
      }

      try {
        const response = await axiosInstance.post("/api/auth/preview-placement", {
          referralId: formData.sponsorId,
          placement: formData.placement
        });

        if (response.data.success) {
          setPlacementPreview(response.data.data);
        } else {
          setPlacementPreview(null);
        }
      } catch (error) {
        // Silent error, just don't show preview
        console.error("Error fetching placement preview", error);
        setPlacementPreview(null);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchPlacementPreview();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [formData.sponsorId, formData.placement]);

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        icon={<UserPlus className="w-6 h-6 text-white" />}
        title="Register New Member"
        subtitle="Add a new member to your team"
      />

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm space-y-8"
      >
        {/* Sponsor Information */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
            Sponsor Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label required>Sponsor ID</Label>
              <div className="relative">
                <Input
                  placeholder="Enter sponsor ID"
                  value={formData.sponsorId}
                  onChange={(e) =>
                    setFormData({ ...formData, sponsorId: e.target.value })
                  }
                  onBlur={handleSponsorIdBlur}
                />
                <button
                  type="button"
                  onClick={() => handleSearchSponsor()}
                  disabled={searchingSponsor}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary-600 transition-colors disabled:opacity-50"
                >
                  {searchingSponsor ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
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
                onValueChange={(value) =>
                  setFormData({ ...formData, placement: value })
                }
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

          {/* Placement Preview Card */}
          {placementPreview && (
            <div className={`mt-6 p-4 rounded-lg border flex items-start gap-3 ${placementPreview.is_direct_placement
              ? 'bg-green-50 border-green-200 text-green-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}>
              <div className={`p-2 rounded-full ${placementPreview.is_direct_placement ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                {placementPreview.is_direct_placement ? (
                  <UserPlus className={`w-5 h-5 ${placementPreview.is_direct_placement ? 'text-green-600' : 'text-blue-600'
                    }`} />
                ) : (
                  <Search className={`w-5 h-5 ${placementPreview.is_direct_placement ? 'text-green-600' : 'text-blue-600'
                    }`} />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">
                  {placementPreview.is_direct_placement
                    ? "Direct Placement Available"
                    : "Auto-Placement Active"}
                </h4>
                <p className="text-sm opacity-90">
                  New member will be placed under <span className="font-bold">{placementPreview.actual_sponsor_name}</span> ({placementPreview.actual_sponsor_referral_id}) on the <span className="font-bold">{placementPreview.placement}</span> side.
                </p>
                {!placementPreview.is_direct_placement && (
                  <p className="text-xs mt-2 opacity-75">
                    Note: Your selected position was occupied, so the system found the next available spot in your team.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Plan Selection */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
            Plan Selection (Optional)
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Label>Select Plan</Label>
              <Select
                value={formData.planId}
                onValueChange={(value) =>
                  setFormData({ ...formData, planId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No plan (can be assigned later)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-plan">No Plan</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - ₹{plan.amount}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                You can assign a plan during registration or activate it later
                through topup.
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label required>Full Name</Label>
              <Input
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label required>Username</Label>
              <Input
                placeholder="Enter username (unique)"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label required>Mobile Number</Label>
              <Input
                type="tel"
                placeholder="Enter mobile number"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>Email ID</Label>
              <Input
                placeholder="Enter email address (optional)"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label required>Password</Label>
              <Input
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label required>Confirm Password</Label>
              <Input
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-6 text-lg shadow-lg shadow-primary-500/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              "Register Member"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={loading}
            className="px-8 py-6 text-lg border-border hover:bg-muted disabled:opacity-50"
          >
            Reset
          </Button>
        </div>
      </form>

      {/* Welcome Modal */}
      {showWelcomeModal && newUserData && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowWelcomeModal(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl relative">
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Welcome to VSV Unite!
                </h2>
                <p className="text-white/90 text-sm">
                  Member registered successfully
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                  <p className="text-sm font-semibold text-foreground">{newUserData.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Username</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{newUserData.username}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(newUserData.username);
                        toast.success("Username copied!");
                      }}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Referral ID</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-primary-600">{newUserData.referralId}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(newUserData.referralId);
                        toast.success("Referral ID copied!");
                      }}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Password</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono font-semibold text-foreground bg-muted px-2 py-1 rounded">
                      {newUserData.password}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(newUserData.password);
                        toast.success("Password copied!");
                      }}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                {newUserData.planName && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Plan</p>
                    <p className="text-sm font-semibold text-foreground">{newUserData.planName}</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Important:</strong> Please save these credentials securely. Share them with the new member for their first login.
                </p>
              </div>

              <Button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-6"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
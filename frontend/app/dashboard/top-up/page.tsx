"use client";

import { useState, useEffect } from "react";
import { CreditCard, Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { axiosInstance } from "@/lib/api";

interface Plan {
  id: string;
  name: string;
  amount: number;
  pv: number;
  description?: string;
}

export default function TopUpPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    memberId: "",
    memberName: "",
    paymentMode: "Bank Transfer",
    transactionDetails: "",
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosInstance.get('/api/plans');
        if (response.data.success) {
          setPlans(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleMemberSearch = async () => {
    if (!formData.memberId) return;

    try {
      const response = await axiosInstance.get(`/api/user/referral/${formData.memberId}`);
      if (response.data.success && response.data.data) {
        setFormData({ ...formData, memberName: response.data.data.name });
      } else {
        alert("Member not found");
        setFormData({ ...formData, memberName: "" });
      }
    } catch (error) {
      console.error("Error searching member:", error);
      alert("Failed to find member");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      alert("Please select a plan");
      return;
    }

    if (!formData.memberId) {
      alert("Please enter member ID");
      return;
    }

    if (!formData.transactionDetails) {
      alert("Please enter transaction details");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axiosInstance.post('/api/topup/request', {
        userId: formData.memberId,
        planId: selectedPlan,
        paymentMethod: formData.paymentMode,
        transactionDetails: formData.transactionDetails,
      });

      if (response.data.success) {
        alert("Top up request submitted successfully!");
        handleReset();
      }
    } catch (error: any) {
      console.error("Error submitting top up:", error);
      alert(error.response?.data?.detail || "Failed to submit top up request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedPlan("");
    setFormData({
      memberId: "",
      memberName: "",
      paymentMode: "Bank Transfer",
      transactionDetails: "",
    });
  };

  if (loading) {
    return (
      <PageContainer maxWidth="2xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="2xl">
      <PageHeader
        icon={<CreditCard className="w-6 h-6 text-white" />}
        title="Top Up"
        subtitle="Purchase a new plan to grow your business"
      />

      {/* Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {plans.map((plan, index) => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={cn(
              "relative p-6 rounded-xl border-2 transition-all text-left group hover:shadow-lg",
              selectedPlan === plan.id
                ? "border-primary-500 bg-primary-50"
                : "border-border bg-card hover:border-primary-200"
            )}
          >
            {index === 1 && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                Popular
              </span>
            )}
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-semibold text-foreground group-hover:text-primary-600 transition-colors">{plan.name}</h3>
              {selectedPlan === plan.id && <Check className="w-5 h-5 text-primary-600" />}
            </div>
            <p className="text-3xl font-bold text-primary-600 mb-1">₹{plan.price.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{plan.pv} PV Points</p>
          </button>
        ))}
      </div>

      {/* Top Up Form */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-6 pb-2 border-b border-border">Top Up Details</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label required>Member ID</Label>
              <div className="relative">
                <Input
                  placeholder="Enter member referral ID"
                  value={formData.memberId}
                  onChange={(e) => setFormData({...formData, memberId: e.target.value})}
                />
                <button
                  type="button"
                  onClick={handleMemberSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary-600 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <Label>Member Name</Label>
              <Input
                placeholder="Auto-filled"
                value={formData.memberName}
                disabled
                className="bg-muted/50"
              />
            </div>
          </div>

          <div>
            <Label required>Selected Package</Label>
            <Select
              value={selectedPlan}
              onValueChange={(value) => setSelectedPlan(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a package from above" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - ₹{plan.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label required>Payment Mode</Label>
            <Select
              value={formData.paymentMode}
              onValueChange={(value) => setFormData({...formData, paymentMode: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label required>Transaction Details</Label>
            <Textarea
              placeholder="Enter transaction ID, reference number, or other payment details"
              value={formData.transactionDetails}
              onChange={(e) => setFormData({...formData, transactionDetails: e.target.value})}
              rows={4}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-6 text-lg shadow-lg shadow-primary-500/20"
          >
            {submitting ? "Submitting..." : "Submit Top Up Request"}
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

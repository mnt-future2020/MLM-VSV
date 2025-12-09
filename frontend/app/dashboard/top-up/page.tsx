"use client";

import { useState, useEffect } from "react";
import { CreditCard, Check, Loader2 } from "lucide-react";
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
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  amount: number;
  pv: number;
  referralIncome: number;
  dailyCapping: number;
}

export default function TopUpPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    paymentMode: "Bank Transfer",
    transactionDetails: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch plans
        const plansResponse = await axiosInstance.get('/api/plans');
        if (plansResponse.data.success) {
          setPlans(plansResponse.data.data || []);
        }
        
        // Fetch fresh user data from dashboard API (not from JWT token)
        const dashboardResponse = await axiosInstance.get('/api/user/dashboard');
        if (dashboardResponse.data.success) {
          const dashboardData = dashboardResponse.data.data;
          // Set current plan from fresh database data
          if (dashboardData.currentPlan) {
            setCurrentPlan(dashboardData.currentPlan.name);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }

    if (!formData.transactionDetails.trim()) {
      toast.error("Please enter transaction details");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axiosInstance.post('/api/topup/request', {
        planId: selectedPlan,
        paymentMethod: formData.paymentMode,
        transactionDetails: formData.transactionDetails
      });

      if (response.data.success) {
        toast.success("Topup request submitted successfully! Waiting for admin approval.");
        setSelectedPlan("");
        setFormData({
          paymentMode: "Bank Transfer",
          transactionDetails: "",
        });
      }
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast.error(error.response?.data?.detail || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleReset = () => {
    setSelectedPlan("");
    setFormData({
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
        title="Plan Upgrade Request"
        subtitle="Submit a request to upgrade your plan"
      />

      {/* Current Plan Display */}
      {currentPlan && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Current Plan</h3>
          <p className="text-2xl font-bold text-blue-700">{currentPlan}</p>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {plans.map((plan, index) => {
          const isCurrentPlan = currentPlan === plan.name;
          
          return (
            <button
              key={plan.id}
              onClick={() => !isCurrentPlan && setSelectedPlan(plan.id)}
              disabled={isCurrentPlan}
              className={cn(
                "relative p-6 rounded-xl border-2 transition-all text-left group hover:shadow-lg",
                isCurrentPlan
                  ? "border-green-500 bg-green-50 cursor-not-allowed opacity-60"
                  : selectedPlan === plan.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-border bg-card hover:border-primary-200"
              )}
            >
              {isCurrentPlan && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                  Current Plan
                </span>
              )}
              {index === 1 && !isCurrentPlan && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                  Popular
                </span>
              )}
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary-600 transition-colors">
                  {plan.name}
                </h3>
                {selectedPlan === plan.id && !isCurrentPlan && <Check className="w-5 h-5 text-primary-600" />}
              </div>
              <p className="text-3xl font-bold text-primary-600 mb-2">₹{plan.amount?.toLocaleString() || 0}</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{plan.pv} PV Points</p>
                <p>₹{plan.referralIncome} Referral Income</p>
                <p>₹{plan.dailyCapping} Daily Cap</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Request Form */}
      {selectedPlan ? (
        <form onSubmit={handleSubmitRequest} className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6 pb-2 border-b border-border">
            Payment & Request Details
          </h2>
          
          <div className="space-y-6">
            <div>
              <Label>Selected Plan</Label>
              <Input
                value={plans.find(p => p.id === selectedPlan)?.name || ""}
                disabled
                className="bg-muted/50 font-medium"
              />
            </div>

            <div>
              <Label>Amount</Label>
              <Input
                value={`₹${plans.find(p => p.id === selectedPlan)?.amount.toLocaleString() || 0}`}
                disabled
                className="bg-muted/50 font-medium text-primary-600"
              />
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
                placeholder="Enter transaction ID, reference number, UTR, or other payment details"
                value={formData.transactionDetails}
                onChange={(e) => setFormData({...formData, transactionDetails: e.target.value})}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Please provide complete payment details for verification
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-6 text-lg shadow-lg shadow-primary-500/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={submitting}
              className="px-8 py-6 text-lg border-border hover:bg-muted"
            >
              Cancel
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Your request will be sent to admin for approval. 
              Plan will be activated once admin approves your payment.
            </p>
          </div>
        </form>
      ) : (
        <div className="bg-muted/50 border border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground">
            Select a plan from above to submit upgrade request
          </p>
        </div>
      )}
    </PageContainer>
  );
}

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
        
        // Set current user's plan
        if (user?.currentPlan) {
          setCurrentPlan(user.currentPlan);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load plans");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleActivatePlan = async () => {
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axiosInstance.post('/api/plans/activate', {
        planId: selectedPlan
      });

      if (response.data.success) {
        toast.success("Plan activated successfully!");
        setCurrentPlan(selectedPlan);
        setSelectedPlan("");
        
        // Reload user data
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Error activating plan:", error);
      toast.error(error.response?.data?.detail || "Failed to activate plan");
    } finally {
      setSubmitting(false);
    }
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
        title="Upgrade Plan"
        subtitle="Choose a plan to activate or upgrade your account"
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

      {/* Activate Button */}
      {selectedPlan && (
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col items-center text-center space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Ready to activate?</h3>
              <p className="text-sm text-muted-foreground">
                Click the button below to activate your selected plan
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <Button
                onClick={handleActivatePlan}
                disabled={submitting}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-6 text-lg shadow-lg shadow-primary-500/20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Activating...
                  </>
                ) : (
                  "Activate Plan"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedPlan("")}
                disabled={submitting}
                className="px-8 py-6 text-lg border-border hover:bg-muted"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {!selectedPlan && (
        <div className="bg-muted/50 border border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground">
            Select a plan from above to get started
          </p>
        </div>
      )}
    </PageContainer>
  );
}

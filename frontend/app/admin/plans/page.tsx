"use client";

import { useState, useEffect } from "react";
import { Gift, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { axiosInstance } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  amount: number;
  pv: number;
  dailyCapping: number;
  matchingIncome: number;
  description: string;
  features: string[];
  isActive: boolean;
  popular?: boolean;
}

export default function AdminPlansPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  // Form state
  const [planForm, setPlanForm] = useState({
    name: "",
    amount: "",
    pv: "",
    dailyCapping: "",
    matchingIncome: "",
    description: "",
    isActive: "true",
    popular: "false"
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/admin/plans');
      if (response.data.success) {
        setPlans(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchPlans();
    }
  }, [user]);

  const resetForm = () => {
    setPlanForm({
      name: "",
      amount: "",
      pv: "",
      dailyCapping: "",
      matchingIncome: "",
      description: "",
      isActive: "true",
      popular: "false"
    });
  };

  const handleCreate = () => {
    resetForm();
    setCreateDialog(true);
  };

  const handleCreateSubmit = async () => {
    // Validation
    if (!planForm.name || !planForm.amount || !planForm.pv) {
      toast.error("Please fill all required fields");
      return;
    }

    setActionLoading(true);
    try {
      const response = await axiosInstance.post('/api/admin/plans', {
        name: planForm.name,
        amount: Number(planForm.amount),
        pv: Number(planForm.pv),
        referralIncome: 0, // Referral income system removed
        dailyCapping: Number(planForm.dailyCapping),
        matchingIncome: Number(planForm.matchingIncome),
        description: planForm.description,
        isActive: planForm.isActive === "true",
        popular: planForm.popular === "true"
      });

      if (response.data.success) {
        toast.success("Plan created successfully");
        setCreateDialog(false);
        fetchPlans();
        resetForm();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create plan");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setPlanForm({
      name: plan.name,
      amount: String(plan.amount),
      pv: String(plan.pv),
      dailyCapping: String(plan.dailyCapping),
      matchingIncome: String(plan.matchingIncome),
      description: plan.description,
      isActive: String(plan.isActive),
      popular: String(plan.popular || false)
    });
    setEditDialog(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedPlan) return;

    setActionLoading(true);
    try {
      const response = await axiosInstance.put(`/api/admin/plans/${selectedPlan.id}`, {
        name: planForm.name,
        amount: Number(planForm.amount),
        pv: Number(planForm.pv),
        referralIncome: 0, // Referral income system removed
        dailyCapping: Number(planForm.dailyCapping),
        matchingIncome: Number(planForm.matchingIncome),
        description: planForm.description,
        isActive: planForm.isActive === "true",
        popular: planForm.popular === "true"
      });

      if (response.data.success) {
        toast.success("Plan updated successfully");
        setEditDialog(false);
        fetchPlans();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update plan");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (plan: Plan) => {
    setSelectedPlan(plan);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPlan) return;

    setActionLoading(true);
    try {
      const response = await axiosInstance.delete(`/api/admin/plans/${selectedPlan.id}`);
      if (response.data.success) {
        toast.success("Plan deleted successfully");
        setDeleteDialog(false);
        fetchPlans();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete plan");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="full">
      <PageHeader
        icon={<Gift className="w-6 h-6 text-white" />}
        title="Plans Management"
        subtitle="Manage membership plans and pricing"
        action={
          <Button onClick={handleCreate} className="bg-primary-600 hover:bg-primary-700">
            <Plus className="w-4 h-4 mr-2" />
            Create New Plan
          </Button>
        }
      />

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "bg-card border rounded-xl p-6 shadow-sm",
              plan.popular ? "border-primary-500 ring-2 ring-primary-200" : "border-border"
            )}
          >
            {plan.popular && (
              <div className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-primary-500 text-white mb-3">
                Popular
              </div>
            )}
            <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-primary-600">₹{plan.amount}</span>
              <span className="text-sm text-muted-foreground ml-2">one-time</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">PV:</span>
                <span className="font-semibold text-foreground">{plan.pv}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Referral Income:</span>
                <span className="font-semibold text-foreground">₹{plan.referralIncome}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Daily Capping:</span>
                <span className="font-semibold text-foreground">₹{plan.dailyCapping}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Matching Income:</span>
                <span className="font-semibold text-foreground">₹{plan.matchingIncome}</span>
              </div>
            </div>

            <div className={cn(
              "inline-flex px-3 py-1 rounded-full text-xs font-medium mb-4",
              plan.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            )}>
              {plan.isActive ? 'Active' : 'Inactive'}
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
              <Button onClick={() => handleEdit(plan)} size="sm" variant="outline" className="flex-1">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button onClick={() => handleDelete(plan)} size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>


      {/* Create Plan Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Plan</DialogTitle>
            <DialogDescription>Add a new membership plan</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Plan Name *</Label>
                <Input
                  value={planForm.name}
                  onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                  placeholder="e.g., Premium Plan"
                />
              </div>
              <div>
                <Label>Amount (₹) *</Label>
                <Input
                  type="number"
                  value={planForm.amount}
                  onChange={(e) => setPlanForm({...planForm, amount: e.target.value})}
                  placeholder="e.g., 1799"
                />
              </div>
              <div>
                <Label>PV (Point Value) *</Label>
                <Input
                  type="number"
                  value={planForm.pv}
                  onChange={(e) => setPlanForm({...planForm, pv: e.target.value})}
                  placeholder="e.g., 1000"
                />
              </div>
              <div>
                <Label>Referral Income (₹)</Label>
                <Input
                  type="number"
                  value={planForm.referralIncome}
                  onChange={(e) => setPlanForm({...planForm, referralIncome: e.target.value})}
                  placeholder="e.g., 200"
                />
              </div>
              <div>
                <Label>Daily Capping (₹)</Label>
                <Input
                  type="number"
                  value={planForm.dailyCapping}
                  onChange={(e) => setPlanForm({...planForm, dailyCapping: e.target.value})}
                  placeholder="e.g., 500"
                />
              </div>
              <div>
                <Label>Matching Income (₹)</Label>
                <Input
                  type="number"
                  value={planForm.matchingIncome}
                  onChange={(e) => setPlanForm({...planForm, matchingIncome: e.target.value})}
                  placeholder="e.g., 100"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={planForm.isActive} onValueChange={(value) => setPlanForm({...planForm, isActive: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Popular Plan?</Label>
                <Select value={planForm.popular} onValueChange={(value) => setPlanForm({...planForm, popular: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={planForm.description}
                onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                placeholder="Plan description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
            <DialogDescription>Update plan details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Plan Name *</Label>
                <Input
                  value={planForm.name}
                  onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Amount (₹) *</Label>
                <Input
                  type="number"
                  value={planForm.amount}
                  onChange={(e) => setPlanForm({...planForm, amount: e.target.value})}
                />
              </div>
              <div>
                <Label>PV (Point Value) *</Label>
                <Input
                  type="number"
                  value={planForm.pv}
                  onChange={(e) => setPlanForm({...planForm, pv: e.target.value})}
                />
              </div>
              <div>
                <Label>Referral Income (₹)</Label>
                <Input
                  type="number"
                  value={planForm.referralIncome}
                  onChange={(e) => setPlanForm({...planForm, referralIncome: e.target.value})}
                />
              </div>
              <div>
                <Label>Daily Capping (₹)</Label>
                <Input
                  type="number"
                  value={planForm.dailyCapping}
                  onChange={(e) => setPlanForm({...planForm, dailyCapping: e.target.value})}
                />
              </div>
              <div>
                <Label>Matching Income (₹)</Label>
                <Input
                  type="number"
                  value={planForm.matchingIncome}
                  onChange={(e) => setPlanForm({...planForm, matchingIncome: e.target.value})}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={planForm.isActive} onValueChange={(value) => setPlanForm({...planForm, isActive: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Popular Plan?</Label>
                <Select value={planForm.popular} onValueChange={(value) => setPlanForm({...planForm, popular: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={planForm.description}
                onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Update Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Plan Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedPlan?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

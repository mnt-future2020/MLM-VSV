"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Package, Plus, Edit, Trash2, Users, DollarSign, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { PageContainer, PageHeader, StatsCard } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/image-upload";
import { axiosInstance } from "@/lib/api";
import { toast } from "sonner";

// Move FormSection outside to prevent recreation
const FormSection = memo(({ 
  title, 
  isExpanded, 
  onToggle, 
  children 
}: { 
  title: string; 
  isExpanded: boolean; 
  onToggle: () => void; 
  children: React.ReactNode;
}) => (
  <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
    <button
      type="button"
      onClick={onToggle}
      className="w-full px-5 py-3 flex items-center justify-between bg-muted/40 hover:bg-muted/60 transition-colors"
    >
      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
        {title}
      </h3>
      {isExpanded ? (
        <ChevronUp className="w-4 h-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
    {isExpanded && (
      <div className="p-5 bg-card">
        {children}
      </div>
    )}
  </div>
));

type Plan = {
  _id?: string;
  id?: string; // For backward compatibility
  name: string;
  description: string;
  price: number;
  pv: number;
  duration: string;
  incomeStart: number; // Auto-calculated from PV
  binaryMatch: number | string;
  dailyCapping: number;
  binaryCondition: string;
  activeUsers: number;
  status: "Active" | "Inactive";
  color: string;
  image?: string; // Optional plan image URL
};

export default function PlanManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    binary: true,
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    pv: "",
    binaryMatch: "", // PV amount (not percentage)
    status: "Active" as "Active" | "Inactive",
    image: "",
  });

  // PV Income Rate (fetched from settings, default 25)
  const [pvIncomeRate, setPvIncomeRate] = useState(25);

  // Stats
  const [stats, setStats] = useState({
    totalPlans: 0,
    activePlans: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });

  // Fetch plans from backend
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/plans');
      if (response.data.success) {
        setPlans(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch plan statistics
  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/api/plans/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Fetch PV income rate from settings
  useEffect(() => {
    const fetchPvRate = async () => {
      try {
        const response = await axiosInstance.get('/api/settings/public');
        if (response.data.success && response.data.data?.pvIncomeRate) {
          setPvIncomeRate(Number(response.data.data.pvIncomeRate));
        }
      } catch (error) {
        console.error('Failed to fetch PV rate:', error);
      }
    };
    fetchPvRate();
    fetchPlans();
    fetchStats();
  }, []);

  // Calculate income start based on PV (configured in settings)
  const calculateIncomeStart = (pv: number): number => {
    // PV × pvIncomeRate
    // Example: PV 1 × 25 = ₹25, PV 2 × 25 = ₹50
    return pv * pvIncomeRate;
  };

  // Calculate daily capping based on binary match and PV income rate
  const calculateDailyCapping = (binaryMatch: number): number => {
    // Binary Match × PV Income Rate
    // Example: 10 × 30 = ₹300
    return binaryMatch * pvIncomeRate;
  };

  // Generate binary condition string
  const generateBinaryCondition = (binaryMatch: number, dailyCapping: number): string => {
    // Example: "Left 10 - Right 10 = ₹300"
    return `Left ${binaryMatch} - Right ${binaryMatch} = ₹${dailyCapping}`;
  };
  const handleCreatePlan = async () => {
    try {
      const response = await axiosInstance.post('/api/plans', {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        pv: Number(formData.pv),
        binaryMatch: Number(formData.binaryMatch),
        status: formData.status,
        image: formData.image,
      });

      if (response.data.success) {
        await fetchPlans();
        await fetchStats();
        setIsCreateOpen(false);
        resetForm();
        toast.success('Plan created successfully!', {
          description: `${formData.name} has been added to your plans`,
        });
      }
    } catch (error: any) {
      console.error('Failed to create plan:', error);
      toast.error('Failed to create plan', {
        description: error.response?.data?.message || 'Please try again',
      });
    }
  };

  const handleEditPlan = async () => {
    if (!editingPlan) return;
    
    try {
      const planId = editingPlan._id || editingPlan.id;
      const response = await axiosInstance.put(`/api/plans/${planId}`, {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        pv: Number(formData.pv),
        binaryMatch: Number(formData.binaryMatch),
        status: formData.status,
        image: formData.image,
      });

      if (response.data.success) {
        await fetchPlans();
        await fetchStats();
        setIsEditOpen(false);
        setEditingPlan(null);
        resetForm();
        toast.success('Plan updated successfully!', {
          description: `${formData.name} has been updated`,
        });
      }
    } catch (error: any) {
      console.error('Failed to update plan:', error);
      toast.error('Failed to update plan', {
        description: error.response?.data?.message || 'Please try again',
      });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    
    try {
      const response = await axiosInstance.delete(`/api/plans/${planId}`);
      
      if (response.data.success) {
        await fetchPlans();
        await fetchStats();
        toast.success('Plan deleted successfully!', {
          description: 'The plan has been removed from your system',
        });
      }
    } catch (error: any) {
      console.error('Failed to delete plan:', error);
      toast.error('Failed to delete plan', {
        description: error.response?.data?.message || 'Please try again',
      });
    }
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: String(plan.price),
      pv: String(plan.pv),
      binaryMatch: String(plan.binaryMatch),
      status: plan.status,
      image: plan.image || "",
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      pv: "",
      binaryMatch: "",
      status: "Active",
      image: "",
    });
  };

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // Memoized form field handlers
  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const renderPlanForm = () => (
    <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
      {/* Basic Information */}
      <FormSection
        title="Basic Information"
        isExpanded={expandedSections.basic}
        onToggle={() => toggleSection("basic")}
      >
        <div className="space-y-5">
          <div>
            <Label required className="text-sm font-medium text-foreground mb-2 block">
              Plan Name
            </Label>
            <Input
              placeholder="e.g., Professional Plan"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="h-12 text-base"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Description
            </Label>
            <Textarea
              placeholder="Brief description of the plan"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={4}
              className="text-base resize-none"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Plan Image
            </Label>
            <ImageUpload
              value={formData.image}
              onChange={(url) => handleFieldChange('image', url)}
              folder="plans"
              label="Upload Plan Image"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required className="text-sm font-medium text-foreground mb-2 block">
                Price (₹)
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.price}
                onChange={(e) => handleFieldChange('price', e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div>
              <Label required className="text-sm font-medium text-foreground mb-2 block">
                PV (Points Value)
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.pv}
                onChange={(e) => handleFieldChange('pv', e.target.value)}
                className="h-12 text-base"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">

            <div>
              <Label required className="text-sm font-medium text-foreground mb-2 block">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleFieldChange('status', value)}
              >
                <SelectTrigger className="h-12 text-base border-2 border-primary-400">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Binary Settings */}
      <FormSection
        title="Binary Settings"
        isExpanded={expandedSections.binary}
        onToggle={() => toggleSection("binary")}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label required className="text-sm font-medium text-foreground mb-2 block">
              Binary Match (PV Amount)
            </Label>
            <Input
              type="number"
              placeholder="10"
              value={formData.binaryMatch}
              onChange={(e) => handleFieldChange('binaryMatch', e.target.value)}
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground mt-1">
              PV amount for matching
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Income Start (₹) <span className="text-xs text-muted-foreground">(Auto-calculated)</span>
            </Label>
            <Input
              type="text"
              value={formData.pv ? `₹${calculateIncomeStart(Number(formData.pv))}` : ''}
              disabled
              className="h-12 text-base bg-muted"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Daily Capping (₹) <span className="text-xs text-muted-foreground">(Auto-calculated)</span>
            </Label>
            <Input
              type="text"
              value={formData.binaryMatch ? `₹${calculateDailyCapping(Number(formData.binaryMatch))}` : ''}
              disabled
              className="h-12 text-base bg-muted"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Binary Condition <span className="text-xs text-muted-foreground">(Auto-generated)</span>
            </Label>
            <Input
              type="text"
              value={formData.binaryMatch ? generateBinaryCondition(Number(formData.binaryMatch), calculateDailyCapping(Number(formData.binaryMatch))) : ''}
              disabled
              className="h-12 text-base bg-muted"
            />
          </div>
        </div>
      </FormSection>


    </div>
  );

  return (
    <PageContainer maxWidth="full">
      <PageHeader
        icon={<Package className="w-6 h-6 text-white" />}
        title="Plan Management"
        subtitle="Create and manage MLM plans"
        action={
          <Button
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="gap-2 bg-primary-500 hover:bg-primary-600 text-white shadow-md"
          >
            <Plus className="w-4 h-4" />
            Create Plan
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Plans"
          value={stats.totalPlans.toString()}
          icon={<Package className="w-6 h-6 text-blue-600" />}
          gradient="bg-blue-500"
        />
        <StatsCard
          label="Active Plans"
          value={stats.activePlans.toString()}
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          gradient="bg-green-500"
        />
        <StatsCard
          label="Total Users"
          value={stats.totalUsers.toString()}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          gradient="bg-purple-500"
        />
        <StatsCard
          label="Total Revenue"
          value={`₹${(stats.totalRevenue / 10000000).toFixed(2)} Cr`}
          icon={<DollarSign className="w-6 h-6 text-orange-600" />}
          gradient="bg-orange-500"
        />
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading plans...</p>
          </div>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Plans Yet</h3>
          <p className="text-muted-foreground mb-4">Create your first plan to get started</p>
          <Button
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="gap-2 bg-primary-500 hover:bg-primary-600 text-white"
          >
            <Plus className="w-4 h-4" />
            Create Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {plans.map((plan) => (
          <div key={plan._id || plan.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  {plan.name}
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] uppercase font-bold text-white", plan.color)}>
                    {plan.status}
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditDialog(plan)}
                  className="p-2 text-muted-foreground hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePlan(plan._id || plan.id || '')}
                  className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pricing & PV */}
            <div className="px-6 py-4 bg-primary-50/30 flex items-center gap-4 border-b border-border">
              <div className="text-2xl font-bold text-primary-700">₹{plan.price.toLocaleString()}</div>
              <div className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded border border-primary-200">
                PV: {plan.pv}
              </div>
              <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded border border-green-200">
                Income: ₹{plan.incomeStart}
              </div>
            </div>

            {/* Details Grid */}
            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-8">
              {/* Binary Settings */}
              <div className="col-span-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Binary Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Binary Match</p>
                    <p className="font-bold text-foreground">{plan.binaryMatch} PV</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Capping</p>
                    <p className="font-bold text-foreground">₹{plan.dailyCapping.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Binary Condition</p>
                    <p className="font-medium text-foreground">{plan.binaryCondition}</p>
                  </div>
                </div>
              </div>

              {/* Active Users */}
              <div className="col-span-2 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Active Users</span>
                </div>
                <span className="font-bold text-foreground">{plan.activeUsers}</span>
              </div>
            </div>
          </div>
          ))}
        </div>
      )}

      {/* Create Plan Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-xl font-bold">Create New Plan</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Add a new plan to your MLM system. Fill in all the required fields below.
            </DialogDescription>
          </DialogHeader>
          {renderPlanForm()}
          <DialogFooter className="pt-4 border-t border-border gap-3 sm:gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsCreateOpen(false)}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePlan} 
              className="h-11 px-6 bg-primary-500 hover:bg-primary-600 text-white font-medium"
            >
              Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-xl font-bold">Edit Plan</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Update the plan details below. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          {renderPlanForm()}
          <DialogFooter className="pt-4 border-t border-border gap-3 sm:gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditOpen(false)}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditPlan} 
              className="h-11 px-6 bg-primary-500 hover:bg-primary-600 text-white font-medium"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

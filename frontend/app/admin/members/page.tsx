"use client";

import { useState, useEffect } from "react";
import { Users, Search, Filter, MoreVertical, Edit, Trash2, Eye, CheckCircle, XCircle, Clock, Key, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageContainer, PageHeader, StatsCard } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

type Member = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  referralId: string;
  currentPlan: string | null;
  isActive: boolean;
  joinedAt: string;
  sponsorId?: string;
  username?: string;
};

export default function ManageMembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  
  // Dialog states
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    mobile: "",
  });
  
  // Password reset state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/admin/users', {
        params: {
          search: searchTerm || undefined,
          limit: 100
        }
      });
      if (response.data.success) {
        setMembers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchMembers();
    }
  }, [user, searchTerm]);

  // View member details
  const handleView = (member: Member) => {
    setSelectedMember(member);
    setViewDialog(true);
  };

  // Edit member
  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setEditForm({
      name: member.name,
      email: member.email,
      mobile: member.mobile || "",
    });
    setEditDialog(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedMember) return;
    
    setActionLoading(true);
    try {
      const response = await axiosInstance.put(`/api/admin/users/${selectedMember.id}`, editForm);
      if (response.data.success) {
        toast.success("Member updated successfully");
        setEditDialog(false);
        fetchMembers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update member");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle active/inactive status
  const handleToggleStatus = async (member: Member) => {
    setActionLoading(true);
    try {
      const response = await axiosInstance.put(`/api/admin/users/${member.id}/status`, {
        isActive: !member.isActive
      });
      if (response.data.success) {
        toast.success(`Member ${!member.isActive ? 'activated' : 'deactivated'} successfully`);
        fetchMembers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = (member: Member) => {
    setSelectedMember(member);
    setNewPassword("");
    setConfirmPassword("");
    setResetPasswordDialog(true);
  };

  const handleResetPasswordSubmit = async () => {
    if (!selectedMember) return;
    
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await axiosInstance.put(`/api/admin/users/${selectedMember.id}/reset-password`, {
        newPassword: newPassword
      });
      if (response.data.success) {
        toast.success("Password reset successfully");
        setResetPasswordDialog(false);
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete member
  const handleDelete = (member: Member) => {
    setSelectedMember(member);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMember) return;
    
    setActionLoading(true);
    try {
      const response = await axiosInstance.delete(`/api/admin/users/${selectedMember.id}`);
      if (response.data.success) {
        toast.success("Member deleted successfully");
        setDeleteDialog(false);
        fetchMembers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete member");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: boolean) => {
    const colorClass = status 
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-red-50 text-red-700 border-red-200";
    
    return (
      <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", colorClass)}>
        {status ? "Active" : "Inactive"}
      </span>
    );
  };

  const filteredMembers = members.filter((member) => {
    if (statusFilter === "Active") return member.isActive;
    if (statusFilter === "Inactive") return !member.isActive;
    return true;
  });

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
        icon={<Users className="w-6 h-6 text-white" />}
        title="Manage Members"
        subtitle="View, edit, and manage all members"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Members"
          value={String(members.length)}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          gradient="bg-blue-500"
        />
        <StatsCard
          label="Active Members"
          value={String(members.filter(m => m.isActive).length)}
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          gradient="bg-green-500"
        />
        <StatsCard
          label="Inactive Members"
          value={String(members.filter(m => !m.isActive).length)}
          icon={<XCircle className="w-6 h-6 text-red-600" />}
          gradient="bg-red-500"
        />
        <StatsCard
          label="With Plans"
          value={String(members.filter(m => m.currentPlan).length)}
          icon={<CheckCircle className="w-6 h-6 text-purple-600" />}
          gradient="bg-purple-500"
        />
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Input
              placeholder="Search by name, ID, email, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Status">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Referral ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Member Details</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Mobile</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Current Plan</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Joined Date</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No members found
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member, index) => (
                  <tr
                    key={member.id}
                    className={cn(
                      "border-b border-border hover:bg-muted/50 transition-colors",
                      index === filteredMembers.length - 1 && "border-0"
                    )}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{member.referralId}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{member.mobile || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {member.currentPlan || 'No Plan'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-muted-foreground">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(member.isActive)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Edit Member">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Toggle Status">
                          {member.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredMembers.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Showing {filteredMembers.length} of {members.length} members
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

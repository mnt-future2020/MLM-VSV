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
  const [plans, setPlans] = useState<any[]>([]);
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
    currentPlan: "",
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
                        <button 
                          onClick={() => handleView(member)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(member)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" 
                          title="Edit Member"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleResetPassword(member)}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" 
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(member)}
                          className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            member.isActive 
                              ? "text-red-600 hover:bg-red-50" 
                              : "text-green-600 hover:bg-green-50"
                          )}
                          title={member.isActive ? "Deactivate" : "Activate"}
                        >
                          {member.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleDelete(member)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Delete Member"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* View Member Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription>Complete information about the member</DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedMember.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Referral ID</Label>
                  <p className="font-medium">{selectedMember.referralId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedMember.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Mobile</Label>
                  <p className="font-medium">{selectedMember.mobile || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Current Plan</Label>
                  <p className="font-medium">{selectedMember.currentPlan || 'No Plan'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-medium">{selectedMember.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Joined Date</Label>
                  <p className="font-medium">{new Date(selectedMember.joinedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>Update member information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                placeholder="Enter name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                placeholder="Enter email"
              />
            </div>
            <div>
              <Label>Mobile</Label>
              <Input
                value={editForm.mobile}
                onChange={(e) => setEditForm({...editForm, mobile: e.target.value})}
                placeholder="Enter mobile number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialog} onOpenChange={setResetPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordDialog(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleResetPasswordSubmit} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Member Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedMember?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

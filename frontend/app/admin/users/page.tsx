"use client";

import { useState, useEffect } from "react";
import { Users, Search, ToggleLeft, ToggleRight } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { axiosInstance } from "@/lib/api";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  referralId: string;
  mobile: string;
  isActive: boolean;
  currentPlan: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(`/api/admin/users?search=${searchQuery}`);
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user, searchQuery]);

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setUpdating(userId);
    try {
      await axiosInstance.put(`/api/admin/users/${userId}/status`, {
        isActive: !currentStatus
      });
      // Refresh users list
      await fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
    } finally {
      setUpdating(null);
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
        icon={<Users className="w-6 h-6 text-white" />}
        title="User Management"
        subtitle="Manage all registered users"
      />

      {/* Search */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, email, referral ID, or mobile..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Referral ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Plan</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email || 'No email'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{u.mobile}</td>
                    <td className="px-6 py-4 text-sm font-mono text-foreground">{u.referralId}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{u.currentPlan || 'No Plan'}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex px-3 py-1 rounded-full text-xs font-medium",
                        u.isActive ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                      )}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleUserStatus(u.id, u.isActive)}
                        disabled={updating === u.id}
                      >
                        {updating === u.id ? (
                          <span className="animate-spin">⏳</span>
                        ) : u.isActive ? (
                          <><ToggleRight className="w-4 h-4 mr-1" />Deactivate</>
                        ) : (
                          <><ToggleLeft className="w-4 h-4 mr-1" />Activate</>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Users, Search, Filter, MoreVertical, Edit, Trash2, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageContainer, PageHeader, StatsCard } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

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
};

export default function ManageMembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
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

    if (user && user.role === 'admin') {
      fetchMembers();
    }
  }, [user, searchTerm]);

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
          <Select
            value={kycFilter}
            onValueChange={(value) => setKycFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All KYC Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All KYC Status">All KYC Status</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
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
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Member ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Member Details</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Package</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">KYC Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Bank Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr
                  key={member.id}
                  className={cn(
                    "border-b border-border hover:bg-muted/50 transition-colors",
                    index === members.length - 1 && "border-0"
                  )}
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{member.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{member.contact}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {member.package}
                    </span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(member.kycStatus, "kyc")}</td>
                  <td className="px-6 py-4">{getStatusBadge(member.bankStatus, "bank")}</td>
                  <td className="px-6 py-4">{getStatusBadge(member.status, "account")}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Edit Member">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete/Block">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Showing 1 to 5 of 1,245 members
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="default" size="sm" className="bg-primary-500 hover:bg-primary-600 text-white">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

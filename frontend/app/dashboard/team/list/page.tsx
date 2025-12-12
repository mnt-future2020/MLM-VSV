"use client";

import { useState, useEffect } from "react";
import { Users, Search, ChevronLeft, ChevronRight, UserPlus, Filter } from "lucide-react";
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
import { useAuth } from "@/contexts/auth-context";
import { axiosInstance } from "@/lib/api";

type TeamMember = {
  id: string;
  name: string;
  referralId: string;
  mobile: string;
  placement: "LEFT" | "RIGHT";
  joinedAt: string;
  currentPlan: string | null;
  isActive: boolean;
};

export default function TeamListPage() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [placementFilter, setPlacementFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await axiosInstance.get('/api/user/team/list');
        if (response.data.success) {
          setTeamMembers(response.data.data);
        }
      } catch (error: any) {
        console.error("Error fetching team list:", error);
        // Show error in UI instead of toast to avoid confusion
        if (error.response?.status === 401) {
          // Token expired, user will be redirected by axios interceptor
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTeam();
    }
  }, [user]);

  // Filter members
  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.referralId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.mobile.includes(searchQuery);
    const matchesPlacement = placementFilter === "all" || member.placement === placementFilter.toUpperCase();
    return matchesSearch && matchesPlacement;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  // Stats
  const totalTeam = teamMembers.length;
  const leftTeam = teamMembers.filter(m => m.placement === "LEFT").length;
  const rightTeam = teamMembers.filter(m => m.placement === "RIGHT").length;
  const activeMembers = teamMembers.filter(m => m.isActive).length;

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
        icon={<Users className="w-6 h-6 text-white" />}
        title="Team Members"
        subtitle="Manage and view your direct referrals"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          label="Total Team"
          value={String(totalTeam)}
          icon={<Users className="w-6 h-6 text-primary-600" />}
          gradient="bg-primary-500"
        />
        <StatsCard
          label="Left Team"
          value={String(leftTeam)}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          gradient="bg-blue-500"
        />
        <StatsCard
          label="Right Team"
          value={String(rightTeam)}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          gradient="bg-purple-500"
        />
        <StatsCard
          label="Active Members"
          value={String(activeMembers)}
          icon={<Users className="w-6 h-6 text-green-600" />}
          gradient="bg-green-500"
        />
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, ID, or contact..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={placementFilter} onValueChange={setPlacementFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Placement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Placements</SelectItem>
              <SelectItem value="left">Left Team</SelectItem>
              <SelectItem value="right">Right Team</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Team List */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Placement
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currentMembers.length > 0 ? (
                currentMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.referralId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">{member.mobile}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex px-3 py-1 rounded-full text-xs font-medium",
                          member.placement === "LEFT"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-purple-50 text-purple-700 border border-purple-200"
                        )}
                      >
                        {member.placement}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">{member.currentPlan || "No Plan"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex px-3 py-1 rounded-full text-xs font-medium",
                          member.isActive
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        )}
                      >
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {searchQuery || placementFilter !== "all"
                        ? "No members found matching your filters"
                        : "No team members yet"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredMembers.length > itemsPerPage && (
          <div className="border-t border-border px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredMembers.length)} of{" "}
              {filteredMembers.length} members
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

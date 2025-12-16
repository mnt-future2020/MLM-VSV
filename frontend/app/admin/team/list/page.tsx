"use client";

import { useState, useEffect } from "react";
import { Users, Search, ChevronLeft, ChevronRight, UserPlus, Eye, X } from "lucide-react";
import { axiosInstance } from "@/lib/api";
import { toast } from "sonner";
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

type TeamMember = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  referralId: string;
  placement: "LEFT" | "RIGHT";
  joinedAt: string;
  currentPlan: string;
  rank?: {
    name: string;
    icon: string;
    color: string;
    minPV: number;
  };
  isActive: boolean;
  sponsorName: string;
  sponsorId: string;
};

type TreeNode = {
  id: string;
  name: string;
  referralId: string;
  placement?: string | null;
  currentPlan?: string | null;
  isActive: boolean;
  leftPV?: number;
  rightPV?: number;
  left?: TreeNode | null;
  right?: TreeNode | null;
};

function TeamMembersModal({
  memberId,
  onClose,
}: {
  memberId: string | null;
  onClose: () => void;
}) {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [memberName, setMemberName] = useState("");

  useEffect(() => {
    if (memberId) {
      fetchMemberTree();
    }
  }, [memberId]);

  const fetchMemberTree = async () => {
    setLoading(true);
    try {
      // First get member details to show name
      const detailsResponse = await axiosInstance.get(`/api/user/details/${memberId}`);
      if (detailsResponse.data.success) {
        setMemberName(detailsResponse.data.data.name);
      }

      // Then get their team tree using admin endpoint
      const response = await axiosInstance.get(`/api/admin/team/tree/${memberId}`);
      if (response.data.success) {
        setTreeData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching member tree:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const renderTreeNode = (node: TreeNode | null, side?: "LEFT" | "RIGHT") => {
    if (!node) {
      return (
        <div className="px-4 py-3 rounded-lg border-2 border-dashed border-border bg-muted/30 min-w-[140px] flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Empty</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-2">
        <div
          className={cn(
            "px-4 py-3 rounded-lg border-2 bg-card shadow-sm min-w-[140px]",
            side === "LEFT"
              ? "border-blue-400"
              : side === "RIGHT"
                ? "border-purple-400"
                : "border-primary-400"
          )}
        >
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-bold text-foreground text-center truncate max-w-[120px]">
              {node.name}
            </p>
            <p className="text-xs text-muted-foreground">{node.referralId}</p>
            {node.currentPlan && (
              <div className="mt-1 px-2 py-0.5 rounded-full bg-primary-50 border border-primary-200">
                <p className="text-xs font-medium text-primary-700">{node.currentPlan}</p>
              </div>
            )}
            {!node.isActive && (
              <div className="mt-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200">
                <p className="text-xs font-medium text-red-600">Inactive</p>
              </div>
            )}
          </div>
        </div>

        {(node.left || node.right) && (
          <>
            <div className="w-0.5 h-6 bg-border"></div>
            <div className="relative w-full">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-border"></div>
              <div className="flex justify-around gap-6 pt-2">
                <div className="relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-border"></div>
                  <div className="pt-6">{renderTreeNode(node.left ?? null, "LEFT")}</div>
                </div>
                <div className="relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-border"></div>
                  <div className="pt-6">{renderTreeNode(node.right ?? null, "RIGHT")}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  if (!memberId) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Team Members</h2>
              <p className="text-sm text-muted-foreground">
                {memberName ? `${memberName}'s Team` : "Loading..."}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : treeData ? (
            <div className="flex justify-center min-w-max">
              {renderTreeNode(treeData)}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No team data available</p>
            </div>
          )}
        </div>

        <div className="border-t border-border p-4 bg-muted/20">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span>Left Team</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-400"></div>
              <span>Right Team</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminTeamListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [placementFilter, setPlacementFilter] = useState("All Placement");
  const [rankFilter, setRankFilter] = useState("All Ranks");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    leftMembers: 0,
    rightMembers: 0,
  });
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Fetch team data
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/admin/team/all');
        if (response.data.success) {
          setTeamMembers(response.data.data.members);
          setStats(response.data.data.stats);
        }
      } catch (error: any) {
        console.error('Failed to fetch team data:', error);
        // Only show toast for non-auth errors
        if (error.response?.status !== 401) {
          toast.error('Failed to load team data', {
            description: error.response?.data?.message || 'Please try again',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  // Filter members based on search and filters
  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlacement =
      placementFilter === "All Placement" || member.placement === placementFilter;

    const matchesRank = rankFilter === "All Ranks" || member.rank?.name === rankFilter;

    return matchesSearch && matchesPlacement && matchesRank;
  });

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "Gold":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Platinum":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Silver":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getPlacementColor = (placement: string) => {
    return placement === "LEFT"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-purple-50 text-purple-700 border-purple-200";
  };

  return (
    <PageContainer maxWidth="2xl">
      <PageHeader
        icon={<Users className="w-6 h-6 text-white" />}
        title="My Team"
        subtitle="View and manage members under your ID"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard
          label="Total Team Members"
          value={stats.totalMembers}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          gradient="bg-blue-500"
        />
        <StatsCard
          label="Left Side Members"
          value={stats.leftMembers}
          icon={<ChevronLeft className="w-6 h-6 text-green-600" />}
          gradient="bg-green-500"
        />
        <StatsCard
          label="Right Side Members"
          value={stats.rightMembers}
          icon={<ChevronRight className="w-6 h-6 text-purple-600" />}
          gradient="bg-purple-500"
        />
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Input
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            value={placementFilter}
            onValueChange={(value) => setPlacementFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Placement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Placement">All Placement</SelectItem>
              <SelectItem value="LEFT">Left Placement</SelectItem>
              <SelectItem value="RIGHT">Right Placement</SelectItem>
            </SelectContent>
          </Select>
          <Select value={rankFilter} onValueChange={(value) => setRankFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Ranks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Ranks">All Ranks</SelectItem>
              <SelectItem value="Gold">Gold</SelectItem>
              <SelectItem value="Platinum">Platinum</SelectItem>
              <SelectItem value="Silver">Silver</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading team members...</p>
            </div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Team Members</h3>
            <p className="text-muted-foreground">
              {searchTerm || placementFilter !== "All Placement" || rankFilter !== "All Ranks"
                ? "No members match your filters"
                : "Start building your team by adding new members"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Member ID</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Name</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Contact</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Placement</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Join Date</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Package</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Rank</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member, index) => (
                    <tr
                      key={member.id}
                      className={cn(
                        "border-b border-border hover:bg-muted/50 transition-colors",
                        index === teamMembers.length - 1 && "border-0"
                      )}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{member.id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{member.mobile}</td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                            getPlacementColor(member.placement)
                          )}
                        >
                          {member.placement}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <span className="text-xs text-muted-foreground">
                          {new Date(member.joinedAt).toLocaleDateString("en-IN", {
                            timeZone: 'Asia/Kolkata',
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{member.currentPlan}</td>
                      <td className="px-6 py-4">
                        {member.rank ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border"
                            style={{
                              backgroundColor: `${member.rank.color}15`,
                              borderColor: member.rank.color,
                              color: member.rank.color
                            }}
                          >
                            <span>{member.rank.icon}</span>
                            <span>{member.rank.name}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                            member.isActive == true
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          )}
                        >
                          {member.isActive}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedMemberId(member.referralId)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Team Members"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
              <p className="text-sm text-muted-foreground">
                Showing {filteredMembers.length} of {stats.totalMembers} members
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="default" size="sm" className="bg-primary-500 hover:bg-primary-600 text-white">1</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Team Members Modal */}
      <TeamMembersModal
        memberId={selectedMemberId}
        onClose={() => setSelectedMemberId(null)}
      />
    </PageContainer>
  );
}

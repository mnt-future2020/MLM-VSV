"use client";

import { useState, useEffect } from "react";
import { Users, Search, ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
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
        action={
          <Button className="gap-2 bg-primary-500 hover:bg-primary-600 text-white shadow-md">
            <UserPlus className="w-4 h-4" />
            Add New Member
          </Button>
        }
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
                  <td className="px-6 py-4 text-sm text-muted-foreground">{member.contact}</td>
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
  {new Date(member.joinedAt).toLocaleDateString("en-GB", {
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
                        member.isActive ==true
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      )}
                    >
                      {member.isActive}
                    </span>
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
    </PageContainer>
  );
}

"use client";

import { useState } from "react";
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

type TeamMember = {
  id: string;
  name: string;
  email: string;
  contact: string;
  placement: "LEFT" | "RIGHT";
  joinDate: string;
  package: string;
  rank: string;
  status: "Active" | "Inactive";
};

const teamMembers: TeamMember[] = [
  {
    id: "MLM-12346",
    name: "Alice Johnson",
    email: "alice@example.com",
    contact: "+91 98765 43210",
    placement: "LEFT",
    joinDate: "2025-11-20",
    package: "Professional Plan",
    rank: "Gold",
    status: "Active",
  },
  {
    id: "MLM-12347",
    name: "Bob Smith",
    email: "bob@example.com",
    contact: "+91 98765 43211",
    placement: "RIGHT",
    joinDate: "2025-11-18",
    package: "Business Plan",
    rank: "Platinum",
    status: "Active",
  },
  {
    id: "MLM-12348",
    name: "Carol White",
    email: "carol@example.com",
    contact: "+91 98765 43212",
    placement: "LEFT",
    joinDate: "2025-11-15",
    package: "Starter Plan",
    rank: "Silver",
    status: "Active",
  },
  {
    id: "MLM-12349",
    name: "David Brown",
    email: "david@example.com",
    contact: "+91 98765 43213",
    placement: "RIGHT",
    joinDate: "2025-11-10",
    package: "Professional Plan",
    rank: "Gold",
    status: "Inactive",
  },
  {
    id: "MLM-12350",
    name: "Emma Davis",
    email: "emma@example.com",
    contact: "+91 98765 43214",
    placement: "LEFT",
    joinDate: "2025-11-05",
    package: "Enterprise Plan",
    rank: "Platinum",
    status: "Active",
  },
];

export default function TeamListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [placementFilter, setPlacementFilter] = useState("All Placement");
  const [rankFilter, setRankFilter] = useState("All Ranks");

  const totalMembers = 145;
  const leftMembers = 68;
  const rightMembers = 77;

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
          value={totalMembers}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          gradient="bg-blue-500"
        />
        <StatsCard
          label="Left Side Members"
          value={leftMembers}
          icon={<ChevronLeft className="w-6 h-6 text-green-600" />}
          gradient="bg-green-500"
        />
        <StatsCard
          label="Right Side Members"
          value={rightMembers}
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
              {teamMembers.map((member, index) => (
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
                  <td className="px-6 py-4 text-sm text-muted-foreground">{member.joinDate}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{member.package}</td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2.5 py-0.5 rounded-md text-xs font-medium border", getRankColor(member.rank))}>
                      {member.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        member.status === "Active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      )}
                    >
                      {member.status}
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
            Showing 1 to 5 of {totalMembers} members
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

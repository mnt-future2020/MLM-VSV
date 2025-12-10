"use client";

import { Users, ZoomIn, ZoomOut, Maximize, Network, X, Phone, Mail, Calendar, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/api";

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

type UserDetails = {
  id: string;
  name: string;
  username: string;
  email: string;
  mobile: string;
  referralId: string;
  sponsorId: string;
  sponsor: { name: string; referralId: string } | null;
  placement?: string;
  isActive: boolean;
  currentPlan: {
    name: string;
    amount: number;
    pv: number;
    dailyCapping: number;
  } | null;
  wallet: {
    balance: number;
    totalEarnings: number;
    totalWithdrawals: number;
  };
  pv: {
    leftPV: number;
    rightPV: number;
    totalPV: number;
    dailyPVUsed: number;
  };
  team: {
    total: number;
    left: number;
    right: number;
  };
  joinedAt: string;
  lastActive: string;
};

function TreeNodeComponent({ 
  node, 
  isRoot = false,
  onNodeClick
}: { 
  node: TreeNode; 
  isRoot?: boolean;
  onNodeClick: (nodeId: string) => void;
}) {
  const isLeft = node.placement === "LEFT";
  const isRight = node.placement === "RIGHT";

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div
        onClick={() => onNodeClick(node.referralId)}
        className={cn(
          "relative px-6 py-4 rounded-xl border-2 min-w-[160px] transition-all hover:scale-105 hover:shadow-lg bg-card z-10 cursor-pointer",
          isRoot
            ? "border-primary-500 shadow-primary-100"
            : isLeft
            ? "border-blue-400 shadow-blue-100"
            : "border-purple-400 shadow-purple-100"
        )}
      >
        <div className="flex flex-col items-center gap-1">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mb-2",
              isRoot
                ? "bg-primary-500"
                : isLeft
                ? "bg-blue-400"
                : "bg-purple-400"
            )}
          >
            <Users className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm font-bold text-foreground text-center">{node.name}</p>
          <p className="text-xs text-muted-foreground">{node.referralId}</p>
          {node.currentPlan && (
            <div className="mt-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-200">
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

      {/* Children */}
      {(node.left || node.right) && (
        <>
          {/* Vertical Line Down */}
          <div className="w-0.5 h-8 bg-border my-2"></div>

          {/* Horizontal Line */}
          <div className="relative w-full">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-border"></div>
            <div className="flex justify-around gap-8 pt-2">
              {/* Left Child */}
              <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-border"></div>
                <div className="pt-8">
                  {node.left ? (
                    <TreeNodeComponent node={node.left} onNodeClick={onNodeClick} />
                  ) : (
                    <div className="px-6 py-4 rounded-xl border-2 border-dashed border-border bg-muted/30 min-w-[160px] flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">Empty</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Child */}
              <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-border"></div>
                <div className="pt-8">
                  {node.right ? (
                    <TreeNodeComponent node={node.right} onNodeClick={onNodeClick} />
                  ) : (
                    <div className="px-6 py-4 rounded-xl border-2 border-dashed border-border bg-muted/30 min-w-[160px] flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function UserDetailsModal({ 
  userId, 
  onClose 
}: { 
  userId: string | null; 
  onClose: () => void;
}) {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/user/details/${userId}`);
      if (response.data.success) {
        setUserDetails(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">User Details</h2>
              <p className="text-sm text-muted-foreground">Complete information</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : userDetails ? (
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="bg-muted/30 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-foreground mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium text-foreground">{userDetails.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Username</p>
                  <p className="text-sm font-medium text-foreground">{userDetails.username}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Referral ID</p>
                  <p className="text-sm font-medium text-primary-600">{userDetails.referralId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={cn(
                    "inline-block px-2 py-1 rounded-full text-xs font-medium",
                    userDetails.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {userDetails.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-muted/30 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-foreground mb-3">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-foreground">{userDetails.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-foreground">{userDetails.mobile}</p>
                </div>
              </div>
            </div>

            {/* Sponsor Info */}
            {userDetails.sponsor && (
              <div className="bg-muted/30 rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-3">Sponsor & Placement Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Sponsor Name</p>
                    <p className="text-sm font-medium text-foreground">{userDetails.sponsor.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sponsor ID</p>
                    <p className="text-sm font-medium text-foreground">{userDetails.sponsor.referralId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Placement Side</p>
                    {userDetails.placement ? (
                      <span className={cn(
                        "inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border",
                        userDetails.placement === 'LEFT' 
                          ? "bg-blue-100 text-blue-800 border-blue-300" 
                          : "bg-purple-100 text-purple-800 border-purple-300"
                      )}>
                        {userDetails.placement}
                      </span>
                    ) : (
                      <p className="text-sm font-medium text-foreground">-</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Plan Info */}
            {userDetails.currentPlan && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <h3 className="font-semibold text-primary-900 mb-3">Current Plan</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-primary-700">Plan Name</p>
                    <p className="text-sm font-medium text-primary-900">{userDetails.currentPlan.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-primary-700">Amount</p>
                    <p className="text-sm font-medium text-primary-900">₹{userDetails.currentPlan.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-primary-700">PV Value</p>
                    <p className="text-sm font-medium text-primary-900">{userDetails.currentPlan.pv} PV</p>
                  </div>
                  <div>
                    <p className="text-xs text-primary-700">Daily Capping</p>
                    <p className="text-sm font-medium text-primary-900">₹{userDetails.currentPlan.dailyCapping}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Info */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Wallet Details
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-green-700">Balance</p>
                  <p className="text-lg font-bold text-green-900">₹{userDetails.wallet.balance}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700">Total Earnings</p>
                  <p className="text-lg font-bold text-green-900">₹{userDetails.wallet.totalEarnings}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700">Withdrawals</p>
                  <p className="text-lg font-bold text-green-900">₹{userDetails.wallet.totalWithdrawals}</p>
                </div>
              </div>
            </div>

            {/* Income Breakdown */}
            {userDetails.incomeBreakdown && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Income Breakdown
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-amber-700">Referral Income</p>
                    <p className="text-lg font-bold text-amber-900">₹{userDetails.incomeBreakdown.REFERRAL_INCOME || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-700">Matching Income</p>
                    <p className="text-lg font-bold text-amber-900">₹{userDetails.incomeBreakdown.MATCHING_INCOME || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-700">Level Income</p>
                    <p className="text-lg font-bold text-amber-900">₹{userDetails.incomeBreakdown.LEVEL_INCOME || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* PV Stats */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                PV Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-blue-700">Left PV</p>
                  <p className="text-lg font-bold text-blue-900">{userDetails.pv.leftPV}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-700">Right PV</p>
                  <p className="text-lg font-bold text-blue-900">{userDetails.pv.rightPV}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-700">Total PV (Lifetime)</p>
                  <p className="text-lg font-bold text-blue-900">{userDetails.pv.totalPV}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-700">Daily PV Used</p>
                  <p className="text-lg font-bold text-blue-900">{userDetails.pv.dailyPVUsed}</p>
                </div>
              </div>
            </div>

            {/* Team Stats */}
            

            {/* Dates */}
            <div className="bg-muted/30 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Activity
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(userDetails.joinedAt).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Active</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(userDetails.lastActive).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            Failed to load user details
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminBinaryTreePage() {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchTree = async () => {
      try {
        const response = await axiosInstance.get('/api/user/team/tree');
        if (response.data.success) {
          setTreeData(response.data.data);
        }
      } catch (error: any) {
        console.error("Error fetching tree:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [mounted]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedUserId(nodeId);
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

  if (!treeData) {
    return (
      <PageContainer maxWidth="full">
        <PageHeader
          icon={<Network className="w-6 h-6 text-white" />}
          title="Binary Tree View"
          subtitle="Visualize your network structure"
        />
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Network className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No team data available</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="full">
      <PageHeader
        icon={<Network className="w-6 h-6 text-white" />}
        title="Binary Tree View"
        subtitle="Click on any user to view detailed information"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-10 w-10 border-border hover:bg-muted">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10 border-border hover:bg-muted">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10 border-border hover:bg-muted">
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        }
      />

      {/* Tree Container */}
      <div className="bg-muted/30 border border-border rounded-2xl p-8 sm:p-12 overflow-x-auto min-h-[600px] flex flex-col items-center justify-center relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>
        
        <div className="flex justify-center min-w-max z-10">
          <TreeNodeComponent node={treeData} isRoot={true} onNodeClick={handleNodeClick} />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-card border border-border rounded-xl p-4 shadow-sm inline-flex flex-wrap gap-6 items-center">
        <span className="text-sm font-semibold text-foreground mr-2">Legend:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-500"></div>
          <span className="text-sm text-muted-foreground">You (Root)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
          <span className="text-sm text-muted-foreground">Left Team</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-400"></div>
          <span className="text-sm text-muted-foreground">Right Team</span>
        </div>
        <div className="text-xs text-muted-foreground italic">
          💡 Tip: Click on any user node to view their complete details
        </div>
      </div>

      {/* User Details Modal */}
      <UserDetailsModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
    </PageContainer>
  );
}

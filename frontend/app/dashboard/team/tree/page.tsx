"use client";

import { Users, ZoomIn, ZoomOut, Maximize, Network, X, Phone, Mail, Calendar, TrendingUp, Wallet, AlertTriangle, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
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
  profilePhoto?: string | null;
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
    planPV: number;
    dailyPVUsed: number;
  };
  team: {
    total: number;
    left: number;
    right: number;
  };
  joinedAt: string;
  lastActive: string;
  incomeBreakdown?: {
    REFERRAL_INCOME: number;
    MATCHING_INCOME: number;
    LEVEL_INCOME: number;
  };
};

type WeakMember = {
  id: string;
  name: string;
  referralId: string;
  side: string;
  totalPV: number;
  leftPV: number;
  rightPV: number;
  currentPlan: string | null;
  isActive: boolean;
  profilePhoto: string | null;
  joinedAt: string;
  weaknessReasons: {
    type: string;
    message: string;
    severity: string;
  }[];
  overallSeverity: string;
};

type WeakMembersData = {
  targetUser: {
    id: string;
    name: string;
    referralId: string;
  };
  summary: {
    totalWeakMembers: number;
    leftSideWeak: number;
    rightSideWeak: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
  };
  weakMembers: WeakMember[];
  leftSideWeak: WeakMember[];
  rightSideWeak: WeakMember[];
};

function TreeNodeComponent({ 
  node, 
  isRoot = false,
  onNodeClick,
  onWeakReportClick
}: { 
  node: TreeNode; 
  isRoot?: boolean;
  onNodeClick: (nodeId: string) => void;
  onWeakReportClick: (nodeId: string) => void;
}) {
  const isLeft = node.placement === "LEFT";
  const isRight = node.placement === "RIGHT";

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div
        className={cn(
          "relative px-6 py-4 rounded-xl border-2 min-w-[160px] transition-all hover:scale-105 hover:shadow-lg bg-card z-10",
          isRoot
            ? "border-primary-500 shadow-primary-100"
            : isLeft
            ? "border-blue-400 shadow-blue-100"
            : "border-purple-400 shadow-purple-100"
        )}
      >
        <div className="flex flex-col items-center gap-1">
          {/* Profile Photo or Default Avatar */}
          <div
            onClick={() => onNodeClick(node.referralId)}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center mb-2 cursor-pointer overflow-hidden border-2",
              isRoot
                ? "border-primary-500 bg-primary-100"
                : isLeft
                ? "border-blue-400 bg-blue-100"
                : "border-purple-400 bg-purple-100"
            )}
          >
            {node.profilePhoto ? (
              <img src={node.profilePhoto} alt={node.name} className="w-full h-full object-cover" />
            ) : (
              <Users className={cn(
                "w-7 h-7",
                isRoot ? "text-primary-600" : isLeft ? "text-blue-600" : "text-purple-600"
              )} />
            )}
          </div>
          <p 
            onClick={() => onNodeClick(node.referralId)}
            className="text-sm font-bold text-foreground text-center cursor-pointer hover:text-primary-600"
          >
            {node.name}
          </p>
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
          {/* Weak Report Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWeakReportClick(node.referralId);
            }}
            className="mt-2 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1"
            title="View Weak Members Report"
          >
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Weak Report</span>
          </button>
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
                    <TreeNodeComponent node={node.left} onNodeClick={onNodeClick} onWeakReportClick={onWeakReportClick} />
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
                    <TreeNodeComponent node={node.right} onNodeClick={onNodeClick} onWeakReportClick={onWeakReportClick} />
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

function WeakMembersModal({ 
  userId, 
  onClose 
}: { 
  userId: string | null; 
  onClose: () => void;
}) {
  const [data, setData] = useState<WeakMembersData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'left' | 'right'>('all');

  useEffect(() => {
    if (userId) {
      fetchWeakMembers();
    }
  }, [userId]);

  const fetchWeakMembers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/tree/weak-members/${userId}`);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching weak members:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getWeaknessBadgeColor = (type: string) => {
    switch (type) {
      case 'INACTIVE': return 'bg-red-50 text-red-600';
      case 'NO_PLAN': return 'bg-orange-50 text-orange-600';
      case 'ZERO_PV': return 'bg-amber-50 text-amber-600';
      case 'LOW_PV': return 'bg-yellow-50 text-yellow-600';
      case 'NO_DOWNLINE': return 'bg-blue-50 text-blue-600';
      case 'UNBALANCED_LEGS': return 'bg-purple-50 text-purple-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const displayMembers = activeTab === 'all' 
    ? data?.weakMembers 
    : activeTab === 'left' 
    ? data?.leftSideWeak 
    : data?.rightSideWeak;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Weak Members Report</h2>
              <p className="text-sm text-muted-foreground">
                {data?.targetUser?.name} ({data?.targetUser?.referralId})
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : data ? (
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Summary Cards */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-amber-700">{data.summary.totalWeakMembers}</p>
                <p className="text-xs text-amber-600">Total Weak</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-700">{data.summary.criticalCount}</p>
                <p className="text-xs text-red-600">Critical</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">{data.summary.leftSideWeak}</p>
                <p className="text-xs text-blue-600">Left Side</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-purple-700">{data.summary.rightSideWeak}</p>
                <p className="text-xs text-purple-600">Right Side</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 flex gap-2">
              {['all', 'left', 'right'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'all' | 'left' | 'right')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeTab === tab
                      ? "bg-primary-500 text-white"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  )}
                >
                  {tab === 'all' ? 'All Members' : tab === 'left' ? 'Left Side' : 'Right Side'}
                </button>
              ))}
            </div>

            {/* Weak Members List */}
            <div className="p-6 space-y-4">
              {displayMembers && displayMembers.length > 0 ? (
                displayMembers.map((member) => (
                  <div 
                    key={member.id} 
                    className={cn(
                      "border rounded-xl p-4",
                      getSeverityColor(member.overallSeverity)
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-white border-2 border-current overflow-hidden flex-shrink-0">
                        {member.profilePhoto ? (
                          <img src={member.profilePhoto} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserX className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{member.name}</h4>
                          <span className="text-xs font-mono">{member.referralId}</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            member.side === 'LEFT' ? 'bg-blue-200 text-blue-800' : 'bg-purple-200 text-purple-800'
                          )}>
                            {member.side}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-bold",
                            getSeverityColor(member.overallSeverity)
                          )}>
                            {member.overallSeverity}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span>PV: {member.totalPV}</span>
                          <span>•</span>
                          <span>L: {member.leftPV} | R: {member.rightPV}</span>
                          <span>•</span>
                          <span>{member.currentPlan || 'No Plan'}</span>
                          <span>•</span>
                          <span>{member.isActive ? 'Active' : 'Inactive'}</span>
                        </div>

                        {/* Weakness Reasons */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {member.weaknessReasons.map((reason, idx) => (
                            <div 
                              key={idx}
                              className={cn(
                                "px-2 py-1 rounded text-xs",
                                getWeaknessBadgeColor(reason.type)
                              )}
                              title={reason.message}
                            >
                              {reason.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>No weak members found in this section!</p>
                  <p className="text-sm">Your team is performing well.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            Failed to load weak members report
          </div>
        )}
      </div>
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
              </div>
            </div>

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
                    {new Date(userDetails.joinedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Active</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(userDetails.lastActive).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
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

export default function BinaryTreePage() {
  const { user } = useAuth();
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [weakReportUserId, setWeakReportUserId] = useState<string | null>(null);

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
        if (error.response?.status === 401) {
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTree();
    } else {
      setLoading(false);
    }
  }, [user, mounted]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedUserId(nodeId);
  };

  const handleWeakReportClick = (nodeId: string) => {
    setWeakReportUserId(nodeId);
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
        subtitle="Click on any user to view details, or click 'Weak Report' to see weak members"
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
          <TreeNodeComponent 
            node={treeData} 
            isRoot={true} 
            onNodeClick={handleNodeClick} 
            onWeakReportClick={handleWeakReportClick}
          />
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
          💡 Click user photo for details • Click "Weak Report" for weakness analysis
        </div>
      </div>

      {/* User Details Modal */}
      <UserDetailsModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />

      {/* Weak Members Report Modal */}
      <WeakMembersModal userId={weakReportUserId} onClose={() => setWeakReportUserId(null)} />
    </PageContainer>
  );
}

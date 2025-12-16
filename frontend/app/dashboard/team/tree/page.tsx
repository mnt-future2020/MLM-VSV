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
  targetUserWeakness?: {
    type: string;
    message: string;
    severity: string;
  } | null;
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
  onWeakReportClick,
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
          "relative z-10 flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 shadow-sm transition-all hover:shadow-lg bg-card min-w-[140px] sm:min-w-[160px]",
          isRoot
            ? "border-primary-500 shadow-primary-100"
            : node.isActive
              ? isLeft ? "border-blue-300 shadow-blue-50" : "border-purple-300 shadow-purple-50"
              : "border-red-200 bg-red-50/10"
        )}
      >
        {/* Placement Badge */}
        {!isRoot && (
          <div className={cn(
            "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm border-2 border-white",
            isLeft ? "bg-blue-500" : "bg-purple-500"
          )}>
            {isLeft ? "LEFT" : "RIGHT"}
          </div>
        )}

        <div className="flex flex-col items-center gap-1.5 w-full cursor-pointer" onClick={() => onNodeClick(node.referralId)}>
          {/* Avatar */}
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2",
            isRoot ? "border-primary-100 bg-primary-50" : "border-gray-100 bg-gray-50"
          )}>
            {node.profilePhoto ? (
              <img src={node.profilePhoto} alt={node.name} className="w-full h-full object-cover" />
            ) : (
              <Users className={cn(
                "w-6 h-6",
                isRoot ? "text-primary-600" : node.isActive ? "text-gray-600" : "text-red-400"
              )} />
            )}
          </div>

          {/* User Info */}
          <div className="text-center w-full">
            <p className="text-xs sm:text-sm font-bold text-foreground truncate max-w-[130px] mx-auto leading-tight">
              {node.name}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-mono mt-0.5">
              {node.referralId}
            </p>
          </div>

          {/* Status & Plan */}
          <div className="flex flex-wrap justify-center gap-1 mt-1">
            {node.currentPlan && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-primary-50 text-primary-700 border border-primary-100">
                {node.currentPlan}
              </span>
            )}
            {!node.isActive && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-red-50 text-red-600 border border-red-100">
                Inactive
              </span>
            )}
          </div>
        </div>

        {/* Hover Actions */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWeakReportClick(node.referralId);
          }}
          className="absolute -right-3 -top-3 w-7 h-7 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-sm opacity-0 hover:scale-110 hover:shadow-md hover:bg-amber-100 transition-all group-hover:opacity-100"
          style={{ opacity: 1 }} /* Always visible for better UX on mobile */
          title="Weak Report"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Connection Lines */}
      {(node.left || node.right) && (
        <div className="flex flex-col items-center w-full">
          {/* Vertical Line from Parent */}
          <div className="w-px h-6 bg-border"></div>

          {/* Branching Container */}
          <div className="relative flex justify-center w-full">
            {/* Horizontal Line Spanning Children Centers */}
            <div className="absolute top-0 h-px bg-border" style={{
              left: '25%',
              right: '25%',
              // Adjust these percentages dynamically if possible, or use calc
              // For a balanced binary tree, 25% and 75% are the midpoints of the children containers
            }}></div>

            <div className="flex w-full justify-between gap-4 sm:gap-8 md:gap-16">
              {/* Left Child Container */}
              <div className="flex-1 flex flex-col items-center relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-border"></div>
                <div className="absolute top-0 left-1/2 w-[50%] h-px bg-border -translate-x-[0%] origin-left scale-x-[-1]"></div> {/* Hack for precise lines? No, use the absolute spanning line above */}
                {/* Actually, let's just draw lines specifically for each child up to the center */}

                {/* Line Stick Up */}
                <div className="h-6"></div>

                {node.left ? (
                  <TreeNodeComponent node={node.left} onNodeClick={onNodeClick} onWeakReportClick={onWeakReportClick} />
                ) : (
                  <EmptyNode label="LEFT" />
                )}
              </div>

              {/* Right Child Container */}
              <div className="flex-1 flex flex-col items-center relative">
                {/* Line Stick Up */}
                <div className="h-6"></div>

                {node.right ? (
                  <TreeNodeComponent node={node.right} onNodeClick={onNodeClick} onWeakReportClick={onWeakReportClick} />
                ) : (
                  <EmptyNode label="RIGHT" />
                )}
              </div>
            </div>

            {/* Redrawing the branching lines to be 100% accurate */}
            {/* Left Connector */}
            <div className="absolute top-0 left-[25%] right-[50%] h-px bg-border"></div>
            {/* Right Connector */}
            <div className="absolute top-0 left-[50%] right-[25%] h-px bg-border"></div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyNode({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-[140px] px-4 py-6 rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <span className="text-xs font-bold text-muted-foreground">{label.charAt(0)}</span>
        </div>
        <span className="text-xs font-medium text-muted-foreground">Empty</span>
      </div>
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

  const getActionTip = (reasons: { type: string; message: string; }[], userName: string) => {
    const mainReason = reasons[0]?.type;
    const name = userName.split(' ')[0];
    switch (mainReason) {
      case 'MISSING_BOTH': return `Help ${name} verify their first 2 direct referrals.`;
      case 'MISSING_LEFT': return `Focus on adding a member to ${name}'s LEFT side.`;
      case 'MISSING_RIGHT': return `Focus on adding a member to ${name}'s RIGHT side.`;
      default: return `Check in with ${name} to see how you can help.`;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Action Needed</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Attention</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Monitor</span>;
    }
  };

  const displayMembers = activeTab === 'all'
    ? data?.weakMembers
    : activeTab === 'left'
      ? data?.leftSideWeak
      : data?.rightSideWeak;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Simple Header */}
        <div className="bg-card border-b border-border p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Team Analysis</h2>
              <p className="text-xs text-muted-foreground">
                Helping {data?.targetUser?.name} grow
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        ) : data ? (
          <div className="flex-1 overflow-y-auto bg-muted/10">

            {/* HERO ALERT: Target User Weakness */}
            {data.targetUserWeakness && (
              <div className="p-5 pb-0">
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex flex-col items-center text-center shadow-sm">
                  <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
                  <h3 className="text-lg font-bold text-red-700 mb-1">
                    ⚠️ {data.targetUserWeakness.message}
                  </h3>
                  <p className="text-sm text-red-600 mb-0 max-w-md">
                    {data.targetUserWeakness.type === 'MISSING_BOTH'
                      ? "This user has no active team. Help them verify their first 2 direct referrals to activate their binary income."
                      : data.targetUserWeakness.type === 'MISSING_LEFT'
                        ? "The Left Leg is empty. Focus on adding a member here."
                        : "The Right Leg is empty. Focus on adding a member here."}
                  </p>
                </div>
              </div>
            )}

            {/* If missing BOTH legs, HIDE the rest of the report */}
            {data.targetUserWeakness?.type === 'MISSING_BOTH' ? (
              <div className="p-12 text-center text-muted-foreground">
                <p className="text-sm">Once they add team members, detailed reports will appear here.</p>
              </div>
            ) : (
              <>
                {/* Simplified Summary */}
                <div className="p-5 grid grid-cols-2 gap-3">
                  <div className="bg-white border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="text-3xl font-black text-red-600 mb-1">{data.summary.criticalCount}</span>
                    <span className="text-sm font-medium text-muted-foreground">Need Help Now</span>
                  </div>
                  <div className="bg-white border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="text-3xl font-black text-amber-600 mb-1">
                      {data.summary.highCount + data.summary.mediumCount}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">Keep Watching</span>
                  </div>
                </div>

                {/* Simple Filters */}
                <div className="px-5 pb-2 flex gap-2">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-semibold transition-all border",
                      activeTab === 'all'
                        ? "bg-foreground text-background border-foreground"
                        : "bg-white text-muted-foreground border-border hover:bg-muted"
                    )}
                  >
                    All Issues
                  </button>
                  <button
                    onClick={() => setActiveTab('left')}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-semibold transition-all border",
                      activeTab === 'left'
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-muted-foreground border-border hover:bg-muted"
                    )}
                  >
                    Left Team
                  </button>
                  <button
                    onClick={() => setActiveTab('right')}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-semibold transition-all border",
                      activeTab === 'right'
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-muted-foreground border-border hover:bg-muted"
                    )}
                  >
                    Right Team
                  </button>
                </div>

                {/* Clean List */}
                <div className="p-5 space-y-3">
                  {displayMembers && displayMembers.length > 0 ? (
                    displayMembers.map((member) => (
                      <div
                        key={member.id}
                        className="bg-white border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0 border">
                            {member.profilePhoto ? (
                              <img src={member.profilePhoto} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-muted-foreground">
                                {member.name.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-bold text-sm text-foreground truncate max-w-[150px]">
                                {member.name}
                              </h4>
                              {getSeverityBadge(member.overallSeverity)}
                            </div>

                            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                              <span className={cn(
                                "w-2 h-2 rounded-full",
                                member.isActive ? "bg-green-500" : "bg-red-500"
                              )}></span>
                              {member.isActive ? "Active Account" : "Inactive Account"}
                              <span className="text-muted-foreground/50">•</span>
                              {member.side === 'LEFT' ? 'Left Team' : 'Right Team'}
                            </p>

                            {/* Main Issue Box */}
                            <div className="bg-muted/30 rounded-lg p-3">
                              <p className="text-xs font-semibold text-foreground mb-1">
                                ⚠️ {member.weaknessReasons[0]?.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                💡 <span className="font-medium text-amber-700">{getActionTip(member.weaknessReasons, member.name)}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-medium text-foreground">All Good Here!</h3>
                      <p className="text-sm text-muted-foreground">No weak members found in this list.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            Unable to load report.
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
          title="Tree View View"
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
        title="Tree View View"
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

"use client";

import { Users, ZoomIn, ZoomOut, Maximize, Network } from "lucide-react";
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

function TreeNodeComponent({ node, isRoot = false }: { node: TreeNode; isRoot?: boolean }) {
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
                    <TreeNodeComponent node={node.left} />
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
                    <TreeNodeComponent node={node.right} />
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

export default function AdminBinaryTreePage() {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before making API calls
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
        // Show error in UI instead of toast to avoid confusion
        if (error.response?.status === 401) {
          // Token expired, user will be redirected by axios interceptor
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [mounted]);

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
        subtitle="Visualize your network structure"
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
          <TreeNodeComponent node={treeData} isRoot={true} />
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
      </div>
    </PageContainer>
  );
}

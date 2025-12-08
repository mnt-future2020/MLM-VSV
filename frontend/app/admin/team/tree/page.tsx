"use client";

import { useState, useEffect } from "react";
import { Users, ZoomIn, ZoomOut, Maximize, Network, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/api";
import { toast } from "sonner";

type TreeNode = {
  id: string;
  _id?: string;
  name: string;
  referralId?: string;
  package?: string;
  position: "left" | "right" | "root";
  children?: TreeNode[];
  hasChildren?: boolean;
  isExpanded?: boolean;
  isLoading?: boolean;
};

export default function AdminBinaryTreePage() {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before making API calls
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch tree data - for admin, we'll show their own tree for now
  useEffect(() => {
    if (!mounted) return;

    const fetchTreeData = async () => {
      try {
        setLoading(true);
        // Admin can use user tree API to see their own tree
        const response = await axiosInstance.get('/api/user/team/tree');
        if (response.data.success) {
          setTreeData(response.data.data);
        }
      } catch (error: any) {
        console.error('Failed to fetch tree data:', error);
        // Only show toast for non-auth errors
        if (error.response?.status !== 401) {
          toast.error('Failed to load binary tree', {
            description: error.response?.data?.message || 'Please try again',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTreeData();
  }, [mounted]);

  // Expand/collapse node and fetch children if needed
  const handleNodeClick = async (node: TreeNode) => {
    console.log('handleNodeClick called:', node.name, node);
    
    if (!node.hasChildren) {
      console.log('Node has no children, returning');
      return;
    }

    const nodeKey = node._id || node.id;
    console.log('Node key:', nodeKey);
    
    // If already expanded, just collapse
    if (expandedNodes.has(nodeKey)) {
      console.log('Collapsing node');
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(nodeKey);
        return newSet;
      });
      return;
    }

    // If has children already loaded, just expand
    if (node.children && node.children.length > 0) {
      console.log('Expanding node with existing children');
      setExpandedNodes(prev => new Set(prev).add(nodeKey));
      return;
    }

    // Fetch children from API
    console.log('Fetching children from API for node:', nodeKey);
    try {
      const response = await axiosInstance.get(`/api/team/node/${nodeKey}/children`);
      console.log('API response:', response.data);
      
      if (response.data.success) {
        const { left, right } = response.data.data;
        
        // Update tree data with new children
        const updateNodeChildren = (n: TreeNode): TreeNode => {
          if ((n._id || n.id) === nodeKey) {
            return {
              ...n,
              children: [left, right].filter(Boolean),
            };
          }
          if (n.children) {
            return {
              ...n,
              children: n.children.map(updateNodeChildren),
            };
          }
          return n;
        };

        if (treeData) {
          setTreeData(updateNodeChildren(treeData));
          setExpandedNodes(prev => new Set(prev).add(nodeKey));
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch node children:', error);
      toast.error('Failed to load children', {
        description: error.response?.data?.message || 'Please try again',
      });
    }
  };

function TreeNodeComponent({ 
  node, 
  onNodeClick,
  expandedNodes
}: { 
  node: TreeNode; 
  onNodeClick: (node: TreeNode) => void;
  expandedNodes: Set<string>;
}) {
  const isRoot = node.position === "root";
  const isLeft = node.position === "left";
  const hasChildren = node.hasChildren || (node.children && node.children.length > 0);
  const nodeKey = node._id || node.id;
  const isExpanded = expandedNodes.has(nodeKey);

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div
        onClick={() => {
          console.log('Node clicked:', node.name, 'hasChildren:', hasChildren);
          if (hasChildren) {
            onNodeClick(node);
          }
        }}
        className={cn(
          "relative px-6 py-4 rounded-xl border-2 min-w-[160px] transition-all hover:scale-105 hover:shadow-lg bg-card z-10",
          hasChildren && "cursor-pointer",
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
              "w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm",
              isRoot
                ? "bg-primary-100 text-primary-600"
                : isLeft
                ? "bg-blue-100 text-blue-600"
                : "bg-purple-100 text-purple-600"
            )}
          >
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-foreground">{node.name}</p>
          <p className="text-xs text-muted-foreground font-medium">{node.referralId || node.id}</p>
          {node.package && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full mt-1 border border-primary-100">
              {node.package}
            </span>
          )}
          
          {/* Expand Indicator */}
          {hasChildren && (
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <ChevronDown 
                className={cn(
                  "w-4 h-4 transition-transform",
                  isExpanded && "rotate-180"
                )} 
              />
              <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
            </div>
          )}
        </div>
        
        {/* Position Badge */}
        {!isRoot && node.position && (
          <div className={cn(
            "absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white",
            isLeft 
              ? "text-blue-600 border-blue-200" 
              : "text-purple-600 border-purple-200"
          )}>
            {node.position.toUpperCase()}
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && node.children && node.children.length > 0 && (
        <>
          {/* Connector Line */}
          <div className="w-0.5 h-8 bg-border my-2"></div>

          {/* Horizontal Line */}
          <div className="relative w-full">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-border"></div>
            <div className="flex justify-around gap-8 pt-2">
              {node.children.map((child) => (
                <div key={child.id} className="relative">
                  {/* Vertical connector */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-border"></div>
                  <div className="pt-8">
                    <TreeNodeComponent 
                      node={child} 
                      onNodeClick={onNodeClick}
                      expandedNodes={expandedNodes}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
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
        
        {loading ? (
          <div className="text-center z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading binary tree...</p>
          </div>
        ) : treeData ? (
          <div className="flex justify-center min-w-max z-10">
            <TreeNodeComponent 
              node={treeData} 
              onNodeClick={handleNodeClick}
              expandedNodes={expandedNodes}
            />
          </div>
        ) : (
          <div className="text-center z-10">
            <Network className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Team Data</h3>
            <p className="text-muted-foreground">Start building your team to see the binary tree</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 bg-card border border-border rounded-xl p-4 shadow-sm inline-flex flex-wrap gap-6 items-center">
        <span className="text-sm font-semibold text-foreground mr-2">Legend:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-500"></div>
          <span className="text-sm text-muted-foreground">You (Root)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm text-muted-foreground">Left Team</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-sm text-muted-foreground">Right Team</span>
        </div>
      </div>
    </PageContainer>
  );
}

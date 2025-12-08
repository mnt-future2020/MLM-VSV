"use client";

import { Users, ZoomIn, ZoomOut, Maximize, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";

type TreeNode = {
  id: string;
  name: string;
  package?: string;
  position: "left" | "right" | "root";
  children?: TreeNode[];
};

const treeData: TreeNode = {
  id: "MLM-12345",
  name: "You",
  package: "Pro Plan",
  position: "root",
  children: [
    {
      id: "MLM-12346",
      name: "Alice Johnson",
      package: "Pro Plan",
      position: "left",
      children: [
        {
          id: "MLM-12348",
          name: "Carol White",
          position: "left",
        },
        {
          id: "MLM-12349",
          name: "David Brown",
          position: "right",
        },
      ],
    },
    {
      id: "MLM-12347",
      name: "Bob Smith",
      package: "Pro Plan",
      position: "right",
      children: [
        {
          id: "MLM-12350",
          name: "Emma Davis",
          position: "left",
        },
        {
          id: "MLM-12351",
          name: "Frank Miller",
          position: "right",
        },
      ],
    },
  ],
};

function TreeNodeComponent({ node }: { node: TreeNode }) {
  const isRoot = node.position === "root";
  const isLeft = node.position === "left";

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
          <p className="text-xs text-muted-foreground font-medium">{node.id}</p>
          {node.package && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full mt-1 border border-primary-100">
              {node.package}
            </span>
          )}
        </div>
        
        {/* Position Badge */}
        {!isRoot && (
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
      {node.children && node.children.length > 0 && (
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
                    <TreeNodeComponent node={child} />
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

export default function BinaryTreePage() {
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
          <TreeNodeComponent node={treeData} />
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

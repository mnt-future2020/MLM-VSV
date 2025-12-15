"use client";

import { Sidebar, SidebarLink } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Toaster } from "sonner";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  CreditCard,
  DollarSign,
  Package,
  FileText,
  Settings,
  LogOut,
  Network,
  List,
  GitBranch,
  TrendingUp,
  FileCheck,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Define sidebar links for admin based on screenshot
  const sidebarLinks: SidebarLink[] = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      isActive: pathname === "/admin/dashboard",
      isSpecial: true,
    },
    {
      label: "New Member",
      href: "/admin/new-member",
      icon: <UserPlus className="w-5 h-5" />,
      isActive: pathname === "/admin/new-member",
    },
    {
      label: "Manage Members",
      href: "/admin/members",
      icon: <Users className="w-5 h-5" />,
      isActive: pathname === "/admin/members",
    },
    // {
    //   label: "User Management",
    //   href: "/admin/users",
    //   icon: <Users className="w-5 h-5" />,
    //   isActive: pathname === "/admin/users",
    // },
    {
      label: "My Team",
      href: "/admin/team/list",
      icon: <Network className="w-5 h-5" />,
      isActive: pathname?.startsWith("/admin/team"),
      hasDropdown: true,
      subLinks: [
        {
          label: "Team List",
          href: "/admin/team/list",
          icon: <List className="w-4 h-4" />,
          isActive: pathname === "/admin/team/list",
        },
        {
          label: "Binary Tree",
          href: "/admin/team/tree",
          icon: <GitBranch className="w-4 h-4" />,
          isActive: pathname === "/admin/team/tree",
        },
      ],
    },
    {
      label: "Manage Topups",
      href: "/admin/topups",
      icon: <CreditCard className="w-5 h-5" />,
      isActive: pathname === "/admin/topups",
    },
    {
      label: "Payout Management",
      href: "/admin/payouts",
      icon: <DollarSign className="w-5 h-5" />,
      isActive: pathname === "/admin/payouts",
    },
    {
      label: "Plan Management",
      href: "/admin/plans",
      icon: <Package className="w-5 h-5" />,
      isActive: pathname === "/admin/plans",
    },
    {
      label: "My Earnings",
      href: "/admin/earnings",
      icon: <TrendingUp className="w-5 h-5" />,
      isActive: pathname === "/admin/earnings",
    },
    {
      label: "Reports",
      href: "/admin/reports",
      icon: <FileText className="w-5 h-5" />,
      isActive: pathname === "/admin/reports",
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: <Settings className="w-5 h-5" />,
      isActive: pathname === "/admin/settings",
    },
    {
      label: "Logout",
      href: "/logout",
      icon: <LogOut className="w-5 h-5" />,
      isActive: false,
    },
  ];

  // Handle link clicks
  const handleLinkClick = async (href: string) => {
    if (href === "/logout") {
      // Handle logout using auth context
      await logout();
    } else {
      router.push(href);
    }
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <Toaster position="top-right" richColors />
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar 
          links={sidebarLinks} 
          user={user ? {
            name: user.name,
            email: user.email,
            role: user.role
          } : undefined}
          onLinkClick={handleLinkClick} 
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </ProtectedRoute>
  );
}

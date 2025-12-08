"use client";

import { Sidebar, SidebarLink } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Toaster } from "sonner";
import {
  LayoutDashboard,
  UserPlus,
  CreditCard,
  User,
  Receipt,
  Users,
  TrendingUp,
  FileText,
  ChevronDown,
  Lock,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Define sidebar links for user
  const sidebarLinks: SidebarLink[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      isActive: pathname === "/dashboard",
    },
    {
      label: "New Member",
      href: "/dashboard/new-member",
      icon: <UserPlus className="w-5 h-5" />,
      isActive: pathname === "/dashboard/new-member",
    },
    {
      label: "Top Up",
      href: "/dashboard/top-up",
      icon: <CreditCard className="w-5 h-5" />,
      isActive: pathname === "/dashboard/top-up",
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: <User className="w-5 h-5" />,
      isActive: pathname.startsWith("/dashboard/profile") || pathname === "/change-password",
      hasDropdown: true,
      subLinks: [
        {
          label: "My Profile",
          href: "/dashboard/profile",
          icon: <User className="w-4 h-4" />,
          isActive: pathname === "/dashboard/profile",
        },
        {
          label: "Edit Profile",
          href: "/dashboard/profile/edit",
          icon: <User className="w-4 h-4" />,
          isActive: pathname === "/dashboard/profile/edit",
        },
        {
          label: "Change Password",
          href: "/change-password",
          icon: <Lock className="w-4 h-4" />,
          isActive: pathname === "/change-password",
        },
      ],
    },
    {
      label: "Transactions",
      href: "/dashboard/transactions",
      icon: <Receipt className="w-5 h-5" />,
      isActive: pathname === "/dashboard/transactions",
    },
    {
      label: "My Team",
      href: "/dashboard/team",
      icon: <Users className="w-5 h-5" />,
      isActive: pathname.startsWith("/dashboard/team"),
      hasDropdown: true,
      subLinks: [
        {
          label: "Team List",
          href: "/dashboard/team/list",
          icon: <Users className="w-4 h-4" />,
          isActive: pathname === "/dashboard/team/list",
        },
        {
          label: "Tree View",
          href: "/dashboard/team/tree",
          icon: <TrendingUp className="w-4 h-4" />,
          isActive: pathname === "/dashboard/team/tree",
        },
      ],
    },
    {
      label: "Earnings",
      href: "/dashboard/earnings",
      icon: <TrendingUp className="w-5 h-5" />,
      isActive: pathname === "/dashboard/earnings",
    },
    {
      label: "Payout Reports",
      href: "/dashboard/payout-reports",
      icon: <FileText className="w-5 h-5" />,
      isActive: pathname === "/dashboard/payout-reports",
    },
    {
      label: "Logout",
      href: "/logout",
      icon: <Lock className="w-5 h-5" />,
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
    <ProtectedRoute>
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

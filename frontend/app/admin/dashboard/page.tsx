"use client";

import { Users, TrendingUp, FileText, LayoutDashboard, ArrowUpRight } from "lucide-react";
import { PageContainer, PageHeader, StatsCard } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  return (
    <PageContainer maxWidth="full">
      <PageHeader
        icon={<LayoutDashboard className="w-6 h-6 text-white" />}
        title="Admin Dashboard"
        subtitle="Overview of system performance and activity"
      />

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Users"
          value="1,234"
          icon={<Users className="w-6 h-6 text-primary-600" />}
          gradient="bg-primary-500"
          trend={{ value: "+12% this month", isPositive: true }}
        />
        <StatsCard
          label="Active Users"
          value="856"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          gradient="bg-green-500"
          trend={{ value: "69% active rate", isPositive: true }}
        />
        <StatsCard
          label="Total Revenue"
          value="₹45.2L"
          icon={<FileText className="w-6 h-6 text-blue-600" />}
          gradient="bg-blue-500"
          trend={{ value: "+8.5% this week", isPositive: true }}
        />
        <StatsCard
          label="New Signups"
          value="+127"
          icon={<LayoutDashboard className="w-6 h-6 text-purple-600" />}
          gradient="bg-purple-500"
          trend={{ value: "Last 24 hours", isPositive: true }}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="p-6 border-b border-border bg-muted/30">
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { action: "New user registered", user: "John Doe", time: "2 minutes ago" },
              { action: "Top-up approved", user: "Alice Smith", time: "15 minutes ago" },
              { action: "Withdrawal requested", user: "Bob Johnson", time: "1 hour ago" },
              { action: "New user registered", user: "Carol White", time: "2 hours ago" },
              { action: "KYC verified", user: "David Brown", time: "3 hours ago" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center border border-primary-100">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.action} <span className="text-muted-foreground">by {item.user}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                  View <ArrowUpRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

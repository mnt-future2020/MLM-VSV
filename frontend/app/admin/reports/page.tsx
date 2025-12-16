"use client";

import { useState, useRef } from "react";
import { FileText, Download, Users, DollarSign, TrendingUp, Network, BarChart3, Calendar } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { axiosInstance } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

// Define types for each report section's date filters
interface SectionFilters {
  startDate: string;
  endDate: string;
  planFilter?: string;
  statusFilter?: string;
}

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Separate filters for each section
  const [sectionFilters, setSectionFilters] = useState<Record<string, SectionFilters>>({
    users: { startDate: "", endDate: "" },
    earnings: { startDate: "", endDate: "" },
    transactions: { startDate: "", endDate: "" },
    payouts: { startDate: "", endDate: "", statusFilter: "all" },
    plans: { startDate: "", endDate: "", planFilter: "all" },
    network: { startDate: "", endDate: "" }
  });

  const updateSectionFilter = (section: string, field: keyof SectionFilters, value: string) => {
    setSectionFilters(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const downloadReport = async (endpoint: string, format: "excel" | "pdf", filename: string, section: string) => {
    try {
      setLoading(true);
      const filters = sectionFilters[section] || { startDate: "", endDate: "" };
      let url = `${endpoint}?format=${format}`;

      if (filters.startDate) url += `&start_date=${filters.startDate}`;
      if (filters.endDate) url += `&end_date=${filters.endDate}`;
      if (filters.planFilter && filters.planFilter !== "all") url += `&plan_id=${filters.planFilter}`;
      if (filters.statusFilter && filters.statusFilter !== "all") url += `&status=${filters.statusFilter}`;

      const response = await axiosInstance.get(url, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: format === "excel"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "application/pdf"
      });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.${format === "excel" ? "xlsx" : "pdf"}`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download report");
    } finally {
      setLoading(false);
    }
  };

  const loadPreview = async (endpoint: string, section: string) => {
    try {
      setLoading(true);
      const filters = sectionFilters[section] || { startDate: "", endDate: "" };
      let url = `${endpoint}?format=json`;

      if (filters.startDate) url += `&start_date=${filters.startDate}`;
      if (filters.endDate) url += `&end_date=${filters.endDate}`;
      if (filters.planFilter && filters.planFilter !== "all") url += `&plan_id=${filters.planFilter}`;
      if (filters.statusFilter && filters.statusFilter !== "all") url += `&status=${filters.statusFilter}`;

      const response = await axiosInstance.get(url);
      if (response.data.success) {
        setReportData(response.data.data || []);
        // Auto scroll to preview section
        setTimeout(() => {
          previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (error) {
      console.error("Preview error:", error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const ReportSection = ({
    title,
    description,
    endpoint,
    icon: Icon,
    sectionKey,
    showPlanFilter = false,
    showStatusFilter = false
  }: {
    title: string;
    description: string;
    endpoint: string;
    icon: any;
    sectionKey: string;
    showPlanFilter?: boolean;
    showStatusFilter?: boolean;
  }) => {
    const filters = sectionFilters[sectionKey] || { startDate: "", endDate: "" };

    return (
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-primary-50 rounded-lg">
            <Icon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-sm mb-2 block">Start Date</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateSectionFilter(sectionKey, "startDate", e.target.value)}
              className="border-border"
            />
          </div>
          <div>
            <Label className="text-sm mb-2 block">End Date</Label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateSectionFilter(sectionKey, "endDate", e.target.value)}
              className="border-border"
            />
          </div>

          {showPlanFilter && (
            <div>
              <Label className="text-sm mb-2 block">Plan Filter</Label>
              <Select value={filters.planFilter || "all"} onValueChange={(val) => updateSectionFilter(sectionKey, "planFilter", val)}>
                <SelectTrigger className="border-border">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showStatusFilter && (
            <div>
              <Label className="text-sm mb-2 block">Status Filter</Label>
              <Select value={filters.statusFilter || "all"} onValueChange={(val) => updateSectionFilter(sectionKey, "statusFilter", val)}>
                <SelectTrigger className="border-border">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => loadPreview(endpoint, sectionKey)}
            disabled={loading}
            className="gap-2"
            variant="outline"
          >
            <FileText className="w-4 h-4" />
            {loading ? "Loading..." : "Preview"}
          </Button>
          <Button
            onClick={() => downloadReport(endpoint, "excel", title.toLowerCase().replace(/\s+/g, '_'), sectionKey)}
            disabled={loading}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4" />
            Download Excel
          </Button>
          <Button
            onClick={() => downloadReport(endpoint, "pdf", title.toLowerCase().replace(/\s+/g, '_'), sectionKey)}
            disabled={loading}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>
    );
  };

  const renderPreviewTable = () => {
    if (reportData.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No data to preview. Click "Preview" button to load data.
        </div>
      );
    }

    const headers = Object.keys(reportData[0]);

    return (
      <div className="overflow-x-auto mt-6 border border-border rounded-xl">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reportData.slice(0, 10).map((row, index) => (
              <tr key={index} className="hover:bg-muted/30">
                {headers.map((header) => (
                  <td key={header} className="px-4 py-3 text-sm text-foreground">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {reportData.length > 10 && (
          <div className="px-4 py-3 bg-muted/30 border-t border-border text-sm text-muted-foreground text-center">
            Showing 10 of {reportData.length} records. Download full report to see all data.
          </div>
        )}
      </div>
    );
  };

  return (
    <PageContainer maxWidth="full">
      <PageHeader
        icon={<BarChart3 className="w-6 h-6 text-white" />}
        title="Advanced Reports"
        subtitle="Generate and download comprehensive business reports"
        action={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            Select date range in each section
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        setReportData([]); // Clear report data when switching tabs
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8 bg-muted">
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            User Reports
          </TabsTrigger>
          <TabsTrigger value="financial">
            <DollarSign className="w-4 h-4 mr-2" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="team">
            <Network className="w-4 h-4 mr-2" />
            Team/Network
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* USER REPORTS TAB */}
        <TabsContent value="users" className="space-y-6">
          <ReportSection
            title="All Members Report"
            description="Complete list of all members with their details, plans, and wallet balance"
            endpoint="/api/admin/reports/users/all"
            icon={Users}
            sectionKey="users"
          />

          <ReportSection
            title="Active/Inactive Users"
            description="Breakdown of active and inactive users in the system"
            endpoint="/api/admin/reports/users/active-inactive"
            icon={Users}
            sectionKey="users"
          />

          <ReportSection
            title="Users by Plan"
            description="Get users filtered by their subscription plan"
            endpoint="/api/admin/reports/users/by-plan"
            icon={Users}
            sectionKey="plans"
            showPlanFilter={true}
          />

          <div ref={previewRef}>{renderPreviewTable()}</div>
        </TabsContent>

        {/* FINANCIAL REPORTS TAB */}
        <TabsContent value="financial" className="space-y-6">
          <ReportSection
            title="Earnings Summary"
            description="Complete earnings breakdown with transaction details"
            endpoint="/api/admin/reports/financial/earnings"
            icon={DollarSign}
            sectionKey="earnings"
          />

          <ReportSection
            title="Income Breakdown by Type"
            description="Analysis of different income types (Referral, Matching, Level)"
            endpoint="/api/admin/reports/financial/income-breakdown"
            icon={TrendingUp}
            sectionKey="earnings"
          />

          <ReportSection
            title="Withdrawals Report"
            description="Complete withdrawal/payout history with status tracking"
            endpoint="/api/admin/reports/financial/withdrawals"
            icon={DollarSign}
            sectionKey="payouts"
            showStatusFilter={true}
          />

          <ReportSection
            title="Topups Report"
            description="History of all wallet topups and recharges"
            endpoint="/api/admin/reports/financial/topups"
            icon={DollarSign}
            sectionKey="transactions"
          />

          <ReportSection
            title="Daily Business Report"
            description="Daily breakdown of registrations, topups, payouts and net business"
            endpoint="/api/admin/reports/financial/business"
            icon={BarChart3}
            sectionKey="earnings"
          />

          <div ref={previewRef}>{renderPreviewTable()}</div>
        </TabsContent>

        {/* TEAM/NETWORK REPORTS TAB */}
        <TabsContent value="team" className="space-y-6">
          <ReportSection
            title="Team Structure"
            description="Complete team hierarchy with sponsor relationships"
            endpoint="/api/admin/reports/team/structure"
            icon={Network}
            sectionKey="network"
          />

          <ReportSection
            title="Downline Summary"
            description="Direct and total downline count for all users"
            endpoint="/api/admin/reports/team/downline"
            icon={Network}
            sectionKey="network"
          />

          <ReportSection
            title="Tree View Export"
            description="Export complete binary tree data with positions and counts"
            endpoint="/api/admin/reports/team/binary-tree"
            icon={Network}
            sectionKey="network"
          />

          <div ref={previewRef}>{renderPreviewTable()}</div>
        </TabsContent>

        {/* ANALYTICS REPORTS TAB */}
        <TabsContent value="analytics" className="space-y-6">
          <ReportSection
            title="Daily Registrations Trend"
            description="Track daily new user registrations over time"
            endpoint="/api/admin/reports/analytics/registrations"
            icon={TrendingUp}
            sectionKey="users"
          />

          <ReportSection
            title="Plan Distribution Analysis"
            description="Analyze user distribution across different plans with revenue"
            endpoint="/api/admin/reports/analytics/plan-distribution"
            icon={BarChart3}
            sectionKey="plans"
          />

          <ReportSection
            title="Growth Statistics"
            description="Monthly growth trends for users and revenue"
            endpoint="/api/admin/reports/analytics/growth"
            icon={TrendingUp}
            sectionKey="earnings"
          />

          <div ref={previewRef}>{renderPreviewTable()}</div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

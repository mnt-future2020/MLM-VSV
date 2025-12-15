"use client";

import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Users,
  FileText,
  AlertCircle
} from "lucide-react";

interface KYCStats {
  pending: number;
  approved: number;
  rejected: number;
  pendingUsers: number;
  total: number;
}

interface KYCSubmission {
  id: string;
  userId: string;
  userName: string;
  userReferralId: string;
  userMobile: string;
  form: any;
  submittedBy: { userId: string; role: string };
  status: string;
  remarks?: string;
  createdAt: string;
}

export default function AdminKYCPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<KYCStats | null>(null);
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("SUBMITTED");

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsResponse = await axiosInstance.get("/api/admin/kyc/stats");
      if (statsResponse.data?.success) {
        setStats(statsResponse.data.data);
      }

      // Fetch submissions based on filter
      const endpoint = filter === "SUBMITTED" 
        ? "/api/admin/kyc/pending"
        : `/api/admin/kyc/all?status=${filter}`;
      
      const submissionsResponse = await axiosInstance.get(endpoint);
      if (submissionsResponse.data?.success) {
        setSubmissions(submissionsResponse.data.data.submissions || []);
      }
    } catch (error) {
      console.error("Error fetching KYC data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!search.trim()) {
      fetchData();
      return;
    }
    
    const filtered = submissions.filter(s => 
      s.userName?.toLowerCase().includes(search.toLowerCase()) ||
      s.userReferralId?.toLowerCase().includes(search.toLowerCase())
    );
    setSubmissions(filtered);
  };

  const filteredSubmissions = search.trim()
    ? submissions.filter(s => 
        s.userName?.toLowerCase().includes(search.toLowerCase()) ||
        s.userReferralId?.toLowerCase().includes(search.toLowerCase())
      )
    : submissions;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return (
          <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded text-sm">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case "APPROVED":
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-sm">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="admin-kyc-list">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">KYC Management</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm">Pending Review</p>
                  <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm">Approved</p>
                  <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm">Rejected</p>
                  <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm">Awaiting KYC</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.pendingUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2">
              {["SUBMITTED", "APPROVED", "REJECTED", "ALL"].map(status => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status)}
                >
                  {status === "SUBMITTED" ? "Pending" : status.charAt(0) + status.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by name or referral ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            KYC Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No KYC submissions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-600">Member</th>
                    <th className="text-left p-3 font-medium text-gray-600">Referral ID</th>
                    <th className="text-left p-3 font-medium text-gray-600">Submitted By</th>
                    <th className="text-left p-3 font-medium text-gray-600">Status</th>
                    <th className="text-left p-3 font-medium text-gray-600">Date</th>
                    <th className="text-left p-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map(submission => (
                    <tr key={submission.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{submission.userName}</p>
                          <p className="text-sm text-gray-500">{submission.userMobile}</p>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-sm">{submission.userReferralId}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          submission.submittedBy?.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700'
                            : submission.submittedBy?.role === 'sponsor'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {submission.submittedBy?.role || 'User'}
                        </span>
                      </td>
                      <td className="p-3">{getStatusBadge(submission.status)}</td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/kyc/${submission.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

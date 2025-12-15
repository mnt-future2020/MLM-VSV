"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { AlertCircle, Clock, XCircle, ArrowRight } from "lucide-react";

export function KYCBanner() {
  const { user } = useAuth();
  const router = useRouter();

  // Don't show banner for admin or active users
  if (!user || user.role === "admin" || user.kycStatus === "ACTIVE") {
    return null;
  }

  const getBannerContent = () => {
    switch (user.kycStatus) {
      case "PENDING_KYC":
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          title: "Complete Your KYC",
          message: "Please complete your KYC verification to activate your account and access all features.",
          bgColor: "bg-amber-50 border-amber-200",
          textColor: "text-amber-800",
          btnColor: "bg-amber-600 hover:bg-amber-700",
          showButton: true
        };
      case "KYC_SUBMITTED":
        return {
          icon: <Clock className="w-5 h-5" />,
          title: "KYC Under Review",
          message: "Your KYC has been submitted and is pending admin approval. This usually takes 24-48 hours.",
          bgColor: "bg-blue-50 border-blue-200",
          textColor: "text-blue-800",
          btnColor: "",
          showButton: false
        };
      case "KYC_REJECTED":
        return {
          icon: <XCircle className="w-5 h-5" />,
          title: "KYC Rejected",
          message: "Your KYC was rejected. Please review the feedback and resubmit with correct information.",
          bgColor: "bg-red-50 border-red-200",
          textColor: "text-red-800",
          btnColor: "bg-red-600 hover:bg-red-700",
          showButton: true
        };
      default:
        return null;
    }
  };

  const content = getBannerContent();
  if (!content) return null;

  return (
    <div className={`${content.bgColor} border rounded-lg p-4 mb-6`} data-testid="kyc-banner">
      <div className="flex items-start gap-3">
        <div className={content.textColor}>
          {content.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${content.textColor}`}>{content.title}</h3>
          <p className={`text-sm mt-1 ${content.textColor} opacity-90`}>{content.message}</p>
        </div>
        {content.showButton && (
          <button
            onClick={() => router.push("/dashboard/kyc")}
            className={`${content.btnColor} text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap`}
          >
            {user.kycStatus === "KYC_REJECTED" ? "Resubmit KYC" : "Complete KYC"}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

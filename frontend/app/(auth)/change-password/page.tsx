"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Lock, Loader2, Eye, EyeOff, ArrowLeft, Shield, User, Mail } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import axiosInstance from "@/lib/api";

interface UserProfile {
  name: string;
  email: string;
  username: string;
  role: string;
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch user profile on mount - requires authentication
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get("/api/user/profile");
        if (response.data.success) {
          setUserProfile(response.data.data);
        }
      } catch (error: any) {
        console.error("Failed to fetch user profile:", error);
        if (error.response?.status === 401) {
          toast.error("Please login to change your password");
          router.push("/login");
        }
      } finally {
        setFetchingUser(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/user/change-password", formData);

      if (response.data.success) {
        toast.success(response.data.message || "Password changed successfully!");
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to change password");
      }
    } catch (error: any) {
      console.error("Change password error:", error);
      
      if (error.response?.status === 401) {
        toast.error("Please login to change your password");
        router.push("/login");
      } else {
        const errorMessage = error.response?.data?.message || "An error occurred while changing password";
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (fetchingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Branding */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2070')",
          }}
        />
        {/* Gradient Overlay with Primary Color */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-400/90 via-primary-600/80 to-black/70" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-8 lg:p-12 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white shadow-md flex items-center justify-center p-1">
                <Image
                  src="/assets/images/logo/vsv-unite.png"
                  alt="VSV Unite Logo"
                  width={50}
                  height={50}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl lg:text-2xl font-bold text-white">
                VSV Unite
              </span>
            </Link>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-lg"
          >
            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 lg:mb-6 leading-tight">
              Secure Your Account
            </h1>
            <p className="text-white/80 text-base lg:text-lg">
              Update your password regularly to keep your account safe and secure.
            </p>
          </motion.div>

          {/* Security Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6"
          >
            <p className="text-white/90 text-sm lg:text-base mb-3">
              🔒 Your password must be at least 6 characters long and different from your current password.
            </p>
            <p className="text-white/70 text-xs lg:text-sm">
              For security reasons, you&apos;ll be logged out from all other devices after changing your password.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-4 py-8 sm:px-6 lg:px-12 min-h-screen">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center p-1">
                <Image
                  src="/assets/images/logo/vsv-unite.png"
                  alt="VSV Unite Logo"
                  width={50}
                  height={50}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">VSV Unite</span>
            </Link>
          </div>

          {/* Back to Login Link */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-500 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Change Password
            </h2>
            <p className="text-gray-500 text-sm lg:text-base">
              Enter your new password below
            </p>
          </div>

          {/* User Info Card */}
          {userProfile && (
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-4 mb-6 border border-primary-200 dark:border-primary-800">
              <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-2">
                Changing password for:
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-200 dark:bg-primary-800 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {userProfile.name || userProfile.username}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {userProfile.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-gray-700 text-sm font-medium"
              >
                New Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Shield className="w-5 h-5" />
                </div>
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="h-11 lg:h-12 pl-12 pr-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-primary-400 focus:ring-primary-400/20 transition-all text-sm lg:text-base"
                  required
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Must be at least 6 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-gray-700 text-sm font-medium"
              >
                Confirm New Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Shield className="w-5 h-5" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="h-11 lg:h-12 pl-12 pr-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-primary-400 focus:ring-primary-400/20 transition-all text-sm lg:text-base"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 lg:h-12 bg-primary-400 hover:bg-primary-500 text-primary-foreground font-semibold text-sm lg:text-base rounded-xl transition-all duration-300 shadow-lg shadow-primary-400/30 hover:shadow-primary-500/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing Password...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-primary-500 hover:text-primary-600 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

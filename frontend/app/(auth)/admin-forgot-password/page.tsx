"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import axiosInstance from "@/lib/api";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(
        "/api/auth/request-password-reset",
        { 
          email,
          redirectTo: `${window.location.origin}/admin-reset-password`
        }
      );

      if (response.status === 200) {
        setIsSubmitted(true);
        toast.success("Password reset link sent to your email");
      } else {
        toast.error(response.data.message || "Failed to send reset link");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              Don&apos;t Worry, We&apos;ve Got You Covered
            </h1>
            <p className="text-white/80 text-base lg:text-lg">
              Enter your email address and we&apos;ll send you instructions to
              reset your password.
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
              🔒 Your account security is our priority. The reset link will
              expire in 1 hour.
            </p>
            <p className="text-white/70 text-xs lg:text-sm">
              If you don&apos;t receive an email within a few minutes, please
              check your spam folder.
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

          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="mb-6 lg:mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Forgot Password?
                </h2>
                <p className="text-gray-500 text-sm lg:text-base">
                  No worries! Enter your email and we&apos;ll send you reset
                  instructions.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-gray-700 text-sm font-medium"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 lg:h-12 pl-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-primary-400 focus:ring-primary-400/20 transition-all text-sm lg:text-base"
                      required
                      disabled={loading}
                    />
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
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </>
          ) : (
            /* Success Message */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h3>
              <p className="text-gray-600 mb-6">
                We&apos;ve sent password reset instructions to
                <br />
                <span className="font-medium text-gray-900">{email}</span>
              </p>
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600">
                  Didn&apos;t receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-primary-500 hover:text-primary-600 font-medium"
                  >
                    try another email address
                  </button>
                </p>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Link>
              </Button>
            </motion.div>
          )}

          {/* Help Text */}
          {!isSubmitted && (
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
          )}
        </motion.div>
      </div>
    </div>
  );
}

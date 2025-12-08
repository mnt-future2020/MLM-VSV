"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Check if input is email or referral ID
      const isEmail = formData.identifier.includes('@');
      let response;
      
      if (isEmail) {
        // Use Better Auth's email sign-in endpoint
        response = await axiosInstance.post('/api/auth/sign-in/email', {
          email: formData.identifier,
          password: formData.password
        });
      } else {
        // Input is referral ID - need to get username first
        // Find user by referral ID
        const userLookup = await axiosInstance.post('/api/auth/lookup-referral', {
          referralId: formData.identifier
        });
        
        if (!userLookup.data.success) {
          setError('Invalid referral ID');
          setLoading(false);
          return;
        }
        
        const { username, email } = userLookup.data.data;
        
        // Use Better Auth's sign-in endpoint based on what user has
        if (email) {
          response = await axiosInstance.post('/api/auth/sign-in/email', {
            email: email,
            password: formData.password
          });
        } else {
          response = await axiosInstance.post('/api/auth/sign-in/username', {
            username: username,
            password: formData.password
          });
        }
      }

      // Backend returns user and token
      if (response.data.user && response.data.token) {
        const userData = response.data.user;
        const token = response.data.token;
        
        // Save token and user to auth context (which saves to localStorage)
        login(userData, token);
        
        // Redirect based on role
        if (userData.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError("Login failed - Invalid response");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "An error occurred. Please try again.");
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
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071')" }}
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
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-white shadow-lg flex items-center justify-center p-2">
                <Image 
                  src="/assets/images/logo/vsv-unite.png" 
                  alt="VSV Unite Logo" 
                  width={80} 
                  height={80}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl lg:text-2xl font-bold text-white">VSV Unite</span>
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
              Welcome Back to Your Financial Journey
            </h1>
            <p className="text-white/80 text-base lg:text-lg">
              Access your dashboard, track your investments, and continue building your wealth with VSV.
            </p>
          </motion.div>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex gap-6 lg:gap-12"
          >
            <div>
              <div className="text-2xl lg:text-4xl font-bold text-white">10K+</div>
              <div className="text-white/60 text-xs lg:text-sm">Active Members</div>
            </div>
            <div>
              <div className="text-2xl lg:text-4xl font-bold text-white">₹50Cr+</div>
              <div className="text-white/60 text-xs lg:text-sm">Total Invested</div>
            </div>
            <div>
              <div className="text-2xl lg:text-4xl font-bold text-white">99%</div>
              <div className="text-white/60 text-xs lg:text-sm">Satisfaction</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-4 py-8 sm:px-6 lg:px-12 min-h-screen">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center p-2 border-2 border-primary-100">
                <Image 
                  src="/assets/images/logo/vsv-unite.png" 
                  alt="VSV Unite Logo" 
                  width={64} 
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-gray-900">VSV Unite</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-500 text-sm lg:text-base">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary-500 hover:text-primary-600 font-medium">
                Create one
              </Link>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
            {/* Referral ID or Email */}
            <div className="space-y-1.5 lg:space-y-2">
              <Label htmlFor="identifier" className="text-gray-700 text-sm font-medium">
                Referral ID or Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Enter your referral ID or email"
                value={formData.identifier}
                onChange={handleChange}
                className="h-11 lg:h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-primary-400 focus:ring-primary-400/20 transition-all text-sm lg:text-base"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                You can use your referral ID (e.g., VSVX7K2M9P) or email address
              </p>
            </div>

            {/* Password */}
            <div className="space-y-1.5 lg:space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700 text-sm font-medium">
                  Password <span className="text-red-500">*</span>
                </Label>
                
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-11 lg:h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-primary-400 focus:ring-primary-400/20 pr-12 transition-all text-sm lg:text-base"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 lg:h-12 bg-primary-400 hover:bg-primary-500 text-primary-foreground font-semibold text-sm lg:text-base rounded-xl transition-all duration-300 shadow-lg shadow-primary-400/30 hover:shadow-primary-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

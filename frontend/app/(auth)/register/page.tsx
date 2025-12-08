"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Eye, EyeOff, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifyingReferral, setVerifyingReferral] = useState(false);
  const [formData, setFormData] = useState({
    referralId: "",
    referralName: "",
    placement: "",  // No default - user must select
    name: "",
    mobile: "",
    email: "",
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError("");
  };

  // Verify referral ID and fetch referrer details
  const verifyReferralId = async (referralId: string) => {
    if (!referralId || referralId.trim() === "") {
      setFormData({ ...formData, referralName: "" });
      return;
    }

    setVerifyingReferral(true);
    setError("");

    try {
      const response = await axiosInstance.get(`/api/user/referral/${referralId}`);
      
      if (response.data.success) {
        const { name } = response.data.data;
        
        // Set referral name only - user can choose any placement
        setFormData(prev => ({ ...prev, referralName: name }));
      }
    } catch (err: unknown) {
      const error = err as any;
      setError(error?.response?.data?.message || "Invalid referral ID");
      setFormData(prev => ({ ...prev, referralName: "" }));
    } finally {
      setVerifyingReferral(false);
    }
  };

  // Handle referral ID blur (when user leaves the field)
  const handleReferralIdBlur = () => {
    if (formData.referralId) {
      verifyReferralId(formData.referralId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Prepare payload - only include referral fields if referralId is provided
      const payload: any = {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        mobile: formData.mobile,
      };

      // Referral ID is now required
      if (!formData.referralId || !formData.referralId.trim()) {
        setError("Referral ID is required");
        return;
      }
      
      if (!formData.placement) {
        setError("Please select placement (Left or Right)");
        return;
      }
      
      payload.referralId = formData.referralId;
      payload.referralName = formData.referralName || '';
      payload.placement = formData.placement;

      // Use custom register endpoint (best method - handles all MLM logic)
      const response = await axiosInstance.post('/api/auth/register', payload);

      // Check success response
      if (response.data.success) {
        router.push("/dashboard");
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err: unknown) {
      const error = err as any;
      setError(error?.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Secure & Trusted Platform",
    "24/7 Customer Support",
    "High Returns on Investment",
    "Easy Withdrawal Process",
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Branding */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=2070')" }}
        />
        {/* Gradient Overlay */}
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
              Start Your Journey to Financial Freedom
            </h1>
            <p className="text-white/80 text-base lg:text-lg mb-6 lg:mb-8">
              Join thousands of successful investors who trust VSV for their financial growth.
            </p>
            
            {/* Features */}
            <div className="space-y-3 lg:space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Check className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                  </div>
                  <span className="text-white/90 text-sm lg:text-base">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6"
          >
            <p className="text-white/90 italic text-sm lg:text-base mb-3 lg:mb-4">
              &quot;VSV has transformed my financial future. The platform is easy to use and the returns are amazing!&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary-400 flex items-center justify-center text-primary-foreground font-bold text-sm lg:text-base shadow-lg shadow-primary-400/30">
                R
              </div>
              <div>
                <div className="text-white font-medium text-sm lg:text-base">Rahul Sharma</div>
                <div className="text-white/60 text-xs lg:text-sm">Member since 2023</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full md:w-1/2 flex items-start md:items-center justify-center bg-white px-4 py-6 sm:px-6 lg:px-8 min-h-screen overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md py-4 md:py-8"
        >
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-4">
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
          <div className="mb-4 lg:mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1 lg:mb-2">Create Account</h2>
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary-500 hover:text-primary-600 font-medium">Sign in</Link>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
            {/* Referral ID */}
            <div className="space-y-1">
              <Label htmlFor="referralId" className="text-gray-700 text-sm font-medium">
                Referral ID <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input 
                  id="referralId" 
                  type="text" 
                  placeholder="Enter Sponsor ID (Required)" 
                  value={formData.referralId} 
                  onChange={handleChange}
                  onBlur={handleReferralIdBlur}
                  className="h-10 lg:h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-primary-400 focus:ring-primary-400/20 text-sm" 
                  disabled={loading || verifyingReferral}
                  required
                />
                {verifyingReferral && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Referral Name - Auto-filled */}
            {formData.referralName && (
              <div className="space-y-1">
                <Label htmlFor="referralName" className="text-gray-700 text-sm font-medium">Referral Name</Label>
                <Input 
                  id="referralName" 
                  type="text" 
                  value={formData.referralName} 
                  className="h-10 lg:h-11 bg-gray-100 border-gray-200 text-gray-900 rounded-xl text-sm" 
                  disabled 
                  readOnly
                />
              </div>
            )}

            {/* Placement - Show if referral ID is provided */}
            {formData.referralId && (
              <div className="space-y-1">
                <Label htmlFor="placement" className="text-gray-700 text-sm font-medium">
                  Placement <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <select 
                    id="placement" 
                    value={formData.placement} 
                    onChange={handleChange} 
                    className="h-10 lg:h-11 w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 pr-10 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 focus:outline-none appearance-none text-sm" 
                    disabled={loading} 
                    required
                  >
                    <option value="">Select Placement</option>
                    <option value="LEFT">LEFT</option>
                    <option value="RIGHT">RIGHT</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="name" className="text-gray-700 text-sm font-medium">Name</Label>
              <Input id="name" type="text" placeholder="Enter name" value={formData.name} onChange={handleChange} className="h-10 lg:h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-primary-400 focus:ring-primary-400/20 text-sm" required disabled={loading} />
            </div>

            {/* Username */}
            <div className="space-y-1">
              <Label htmlFor="username" className="text-gray-700 text-sm font-medium">Username</Label>
              <Input id="username" type="text" placeholder="Choose username" value={formData.username} onChange={handleChange} className="h-10 lg:h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-primary-400 focus:ring-primary-400/20 text-sm" required disabled={loading} />
            </div>

            {/* Mobile No */}
            <div className="space-y-1">
              <Label htmlFor="mobile" className="text-gray-700 text-sm font-medium">Mobile No</Label>
              <Input id="mobile" type="tel" placeholder="Mobile No" value={formData.mobile} onChange={handleChange} className="h-10 lg:h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-primary-400 focus:ring-primary-400/20 text-sm" required disabled={loading} />
            </div>

            {/* Email ID - Optional */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-gray-700 text-sm font-medium">
                Email ID <span className="text-gray-400 font-normal">(Optional)</span>
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter Email ID (Optional)" 
                value={formData.email} 
                onChange={handleChange} 
                className="h-10 lg:h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-primary-400 focus:ring-primary-400/20 text-sm" 
                disabled={loading} 
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-gray-700 text-sm font-medium">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter Password" value={formData.password} onChange={handleChange} className="h-10 lg:h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-primary-400 focus:ring-primary-400/20 pr-11 text-sm" required disabled={loading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 pt-1">
              <input type="checkbox" id="terms" className="mt-0.5 w-4 h-4 text-primary-400 border-gray-300 rounded focus:ring-primary-400" required />
              <label htmlFor="terms" className="text-xs lg:text-sm text-gray-500">
                I agree to the <Link href="/terms" className="text-primary-500 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary-500 hover:underline">Privacy Policy</Link>
              </label>
            </div>

            {/* Register Button */}
            <Button type="submit" disabled={loading} className="w-full h-10 lg:h-12 bg-primary-400 hover:bg-primary-500 text-primary-foreground font-semibold text-sm lg:text-base rounded-xl transition-all duration-300 shadow-lg shadow-primary-400/30 hover:shadow-primary-500/50 hover:scale-[1.02] active:scale-[0.98] mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

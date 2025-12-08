"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImagesSlider } from "@/components/ui/images-slider";
import { motion } from "framer-motion";
import { ArrowRight, Users, TrendingUp, Shield, Wallet, Network, BarChart3, Check } from "lucide-react";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { axiosInstance } from "@/lib/api";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch public settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axiosInstance.get("/api/settings/public");
        if (response.data.success) {
          setSettings(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Default fallback data
  const heroImages = settings?.heroSlides?.map((slide: any) => slide.image) || [
    "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2074&auto=format&fit=crop",
  ];

  const slides = settings?.heroSlides || [
    {
      headline: "Build Your Network. Unlock Unlimited Income.",
      subHeadline: "Join VSV Unite Marketing and start earning through our transparent PV-based binary model. Grow your left & right teams and watch your income multiply.",
      highlights: ["Simple Registration", "Instant Referral Bonuses", "Automated PV Matching Income"],
      ctaPrimary: "Join Now",
      ctaSecondary: "View Plans"
    },
    {
      headline: "Achieve More With Smart Binary PV Earnings",
      subHeadline: "Activate your membership, share your referral link, and earn matching bonuses as your team expands. Your success starts with a single step.",
      highlights: ["Real-Time PV Tracking", "Direct & Matching Income", "Secure Wallet & Fast Payouts"],
      ctaPrimary: "Activate Membership",
      ctaSecondary: "Check Earnings"
    },
    {
      headline: "Your Path to Financial Freedom Starts Here",
      subHeadline: "A trusted membership platform designed to help you build, grow, and earn consistently with a sustainable binary network.",
      highlights: ["Transparent System", "Easy-to-Use Dashboard", "24/7 Member Support"],
      ctaPrimary: "Get Started",
      ctaSecondary: "Learn More"
    }
  ];

  const heroBadge = settings?.heroBadge || "Transparent MLM Platform • Binary + PV System";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Image Carousel - Full Screen */}
      <ImagesSlider className="h-screen w-full" images={heroImages} onIndexChange={setCurrentSlide}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="z-50 flex flex-col justify-center items-center px-6 text-center max-w-5xl mx-auto"
          >
            <Badge variant="outline" className="gap-2 text-sm px-4 py-2 mb-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <span>{heroBadge}</span>
            </Badge>

            <motion.h1 
              className="font-bold text-4xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-300 py-4"
            >
              {slides[currentSlide].headline}
            </motion.h1>

            <motion.p className="text-lg md:text-xl text-neutral-200 max-w-2xl mt-4 mb-6">
              {slides[currentSlide].subHeadline}
            </motion.p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {slides[currentSlide]?.highlights?.map((highlight: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-white/90 bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                  <Check className="w-4 h-4 text-primary-400" />
                  <span className="text-sm">{highlight}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2 text-base px-8 py-6 bg-primary-400 hover:bg-primary-500 text-primary-foreground">
                {slides[currentSlide].ctaPrimary}
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 py-6 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                {slides[currentSlide].ctaSecondary}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </ImagesSlider>

      {/* Quick Intro - Redesigned */}
      <section className="px-6 py-20 sm:px-8 lg:px-12 bg-gradient-to-b from-base-50 to-background">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center space-y-6 mb-16"
          >
            <Badge className="bg-primary-100 text-primary-700 border-primary-200">
              About VSV Unite
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              What is <span className="text-primary-600">VSV Unite?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A revolutionary membership-based MLM system designed for transparency, 
              automation, and sustainable income growth.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Binary Team Structure
                  </h3>
                  <p className="text-muted-foreground">
                    Build your network with an easy-to-understand left and right team system that maximizes your earning potential.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    PV Matching Income
                  </h3>
                  <p className="text-muted-foreground">
                    Earn automatically when your left and right teams match Point Values - completely transparent and real-time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Secure & Transparent
                  </h3>
                  <p className="text-muted-foreground">
                    Withdraw earnings anytime with complete visibility into your income, team performance, and growth metrics.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Dashboard Mockup Image */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-primary-200 shadow-2xl">
                {/* Dashboard Screenshot/Mockup */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-primary-50 to-primary-100">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=entropy"
                    alt="VSV Unite Dashboard"
                    className="w-full h-full object-cover opacity-90"
                  />
                  {/* Overlay with stats */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent" />
                  
                  {/* Floating Stats Cards */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                   
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
                className="absolute -bottom-4 -right-4 bg-primary-400 text-primary-foreground px-6 py-3 rounded-full shadow-xl border-4 border-background"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Verified Platform</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works - Redesigned with Primary Colors */}
      <section className="px-6 py-20 sm:px-8 lg:px-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 to-background" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(var(--primary-200) / 0.3) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
        
        <div className="mx-auto max-w-7xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-20"
          >
            <Badge className="bg-primary-400 text-primary-foreground border-0 shadow-lg">
              4 Simple Steps
            </Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
              How It <span className="text-primary-600">Works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start your journey to financial freedom in just 4 easy steps
            </p>
          </motion.div>

          {/* Vertical Timeline for Mobile/Tablet */}
          <div className="lg:hidden space-y-8">
            {[
              {
                step: "01",
                title: "Register Your Account",
                description: "Create your profile and get your unique referral link to start building your network.",
                icon: Users,
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=entropy",
              },
              {
                step: "02",
                title: "Activate Your Membership",
                description: "Choose a membership plan that fits your goals and activate to unlock earning potential.",
                icon: Shield,
                image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop&crop=entropy",
              },
              {
                step: "03",
                title: "Build Your Binary Team",
                description: "Add members to your Left & Right structure and watch your network grow exponentially.",
                icon: Network,
                image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop&crop=faces",
              },
              {
                step: "04",
                title: "Earn PV Matching Income",
                description: "Receive automatic income when your teams match Point Values - transparent and instant.",
                icon: TrendingUp,
                image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop&crop=entropy",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative flex gap-6"
              >
                {/* Timeline Line */}
                {index < 3 && (
                  <div className="absolute left-8 top-20 w-0.5 h-full bg-gradient-to-b from-primary-400 to-primary-200" />
                )}
                
                {/* Step Number */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary-400 text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-primary-100">
                    {item.step}
                  </div>
                </div>
                
                {/* Content Card */}
                <div className="flex-1 pb-8">
                  <div className="rounded-2xl bg-card border-2 border-primary-200 hover:border-primary-400 transition-all hover:shadow-xl overflow-hidden">
                    {/* Step Image */}
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      <div className="absolute bottom-3 left-3 w-12 h-12 rounded-xl bg-primary-400 flex items-center justify-center shadow-lg">
                        <item.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-3">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Horizontal Flow for Desktop */}
          <div className="hidden lg:block">
            {/* Connecting Line */}
            <div className="relative mb-16">
              <div className="absolute left-0 right-0 top-1/2 h-2 bg-gradient-to-r from-primary-200 via-primary-300 to-primary-400 rounded-full -translate-y-1/2" />
              <div className="relative grid grid-cols-4 gap-8">
                {["01", "02", "03", "04"].map((num, index) => (
                  <motion.div
                    key={num}
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.15, type: "spring" }}
                    viewport={{ once: true }}
                    className="flex justify-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-primary-400 text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-2xl ring-8 ring-background relative">
                      {num}
                      <div className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-20" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Step Cards */}
            <div className="grid grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  title: "Register Your Account",
                  description: "Create your profile and get your unique referral link to start building your network.",
                  icon: Users,
                  image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=entropy",
                },
                {
                  step: "02",
                  title: "Activate Your Membership",
                  description: "Choose a membership plan that fits your goals and activate to unlock earning potential.",
                  icon: Shield,
                  image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop&crop=entropy",
                },
                {
                  step: "03",
                  title: "Build Your Binary Team",
                  description: "Add members to your Left & Right structure and watch your network grow exponentially.",
                  icon: Network,
                  image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop&crop=faces",
                },
                {
                  step: "04",
                  title: "Earn PV Matching Income",
                  description: "Receive automatic income when your teams match Point Values - transparent and instant.",
                  icon: TrendingUp,
                  image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop&crop=entropy",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <div className="relative rounded-2xl bg-card border-2 border-primary-200 hover:border-primary-400 transition-all hover:shadow-2xl h-full overflow-hidden">
                    {/* Hover Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl z-10 pointer-events-none" />
                    
                    {/* Step Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 w-14 h-14 rounded-xl bg-primary-400 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
                        <item.icon className="w-7 h-7 text-primary-foreground" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative p-6 space-y-3">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary-700 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                      <div className="pt-2 flex items-center text-primary-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features - Card Grid Design */}
      <section className="px-6 py-20 md:py-32 bg-base-50">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-12 md:mb-16"
          >
            <Badge className="bg-primary-400 text-primary-foreground border-0">
              Platform Features
            </Badge>
            <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
              Built to Power Your Success
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build and manage your network income with complete transparency and automation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Automated PV Calculation",
                description: "Real-time point value tracking and matching system that calculates your earnings automatically.",
                icon: BarChart3,
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=entropy",
              },
              {
                title: "Binary Team Structure",
                description: "Simple left and right team system that makes network building easy to understand and manage.",
                icon: Network,
                image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop&crop=entropy",
              },
              {
                title: "Easy Referral Sharing",
                description: "WhatsApp-friendly referral links that make it simple to invite new members instantly.",
                icon: Users,
                image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop&crop=entropy",
              },
              {
                title: "Real-Time Wallet",
                description: "Monitor your income instantly with live updates showing all earnings and team performance.",
                icon: Wallet,
                image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop&crop=entropy",
              },
              {
                title: "Fast Withdrawals",
                description: "Quick and secure withdrawal processing with multiple payment options for your convenience.",
                icon: Shield,
                image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop&crop=entropy",
              },
              {
                title: "Full Dashboard",
                description: "Complete team reports and analytics with detailed insights into your network growth.",
                icon: TrendingUp,
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=entropy",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group h-full shadow-sm hover:shadow-xl transition-all duration-300 border-primary-100 hover:border-primary-400 overflow-hidden">
                  {/* Feature Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    
                    {/* Icon Badge */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                      <div className="relative w-16 h-16 rounded-2xl bg-primary-400 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <feature.icon className="w-8 h-8 text-primary-foreground" />
                        {/* Decorative corners */}
                        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white/30 rounded-tl" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white/30 rounded-tr" />
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white/30 rounded-bl" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white/30 rounded-br" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <CardHeader className="pb-3">
                    <h3 className="text-center font-medium text-foreground group-hover:text-primary-600 transition-colors">
                      {feature.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-center text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Preview - Modern Glass Design */}
      <section className="px-6 py-20 md:py-32 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary-50/30 to-background" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(oklch(var(--primary-200) / 0.15) 0.8px, transparent 0.8px)',
            backgroundSize: '14px 14px',
            maskImage: 'radial-gradient(circle at 50% 30%, rgba(0,0,0,1), rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 80%)',
          }}
        />

        <div className="mx-auto max-w-5xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-12 md:mb-20"
          >
            <Badge className="bg-primary-400 text-primary-foreground border-0">
              Membership Plans
            </Badge>
            <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground mx-auto max-w-xl text-balance text-lg">
              Select the perfect membership plan for your earnings and start building your network today
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Basic",
                amount: "₹111",
                pv: "1 PV",
                description: "Start small, earn steady",
                icon: Users,
                features: [
                  "Income Start: ₹25",
                  "Daily Capping: ₹250",
                  "Binary: Left 10 - Right 10 = ₹250",
                  "Basic Support",
                ],
              },
              {
                name: "Standard",
                amount: "₹599",
                pv: "2 PV",
                description: "Popular choice for growth",
                icon: TrendingUp,
                features: [
                  "Income Start: ₹50",
                  "Daily Capping: ₹500",
                  "Binary: Left 10 - Right 10 = ₹500",
                  "Standard Support",
                ],
                popular: true,
              },
              {
                name: "Advanced",
                amount: "₹1199",
                pv: "4 PV",
                description: "Accelerate your earnings",
                icon: Shield,
                features: [
                  "Income Start: ₹100",
                  "Daily Capping: ₹1000",
                  "Binary: Left 10 - Right 10 = ₹1000",
                  "Priority Support",
                ],
              },
              {
                name: "Premium",
                amount: "₹1799",
                pv: "6 PV",
                description: "Maximum earning potential",
                icon: Network,
                features: [
                  "Income Start: ₹150",
                  "Daily Capping: ₹1500",
                  "Binary: Left 10 - Right 10 = ₹1500",
                  "VIP Support",
                ],
              },
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`relative w-full rounded-xl p-1.5 shadow-xl backdrop-blur-xl border ${
                  plan.popular 
                    ? 'bg-primary-400 border-primary-500' 
                    : 'bg-card border-border'
                }`}>
                  {/* Card Header with Glass Effect */}
                  <div className={`relative mb-4 rounded-xl border p-4 ${
                    plan.popular 
                      ? 'bg-primary-500/80 border-primary-400' 
                      : 'bg-muted/80 border-border'
                  }`}>
                    {/* Glass gradient overlay */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-48 rounded-[inherit]"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)',
                      }}
                    />
                    
                    {/* Plan Name & Badge */}
                    <div className="mb-8 flex items-center justify-between relative">
                      <div className={`flex items-center gap-2 text-sm font-medium ${
                        plan.popular ? 'text-primary-foreground' : 'text-muted-foreground'
                      }`}>
                        <plan.icon className="w-4 h-4" />
                        <span>{plan.name}</span>
                      </div>
                      {plan.popular && (
                        <span className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-2 py-0.5 text-xs text-primary-foreground">
                          Popular
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-3 flex items-end gap-1 relative">
                      <span className={`text-3xl font-extrabold tracking-tight ${
                        plan.popular ? 'text-primary-foreground' : 'text-foreground'
                      }`}>
                        {plan.amount}
                      </span>
                      <span className={`pb-1 text-sm ${
                        plan.popular ? 'text-primary-foreground/80' : 'text-foreground/80'
                      }`}>
                        / {plan.pv}
                      </span>
                    </div>

                    {/* CTA Button */}
                    <Button
                      className={`w-full font-semibold ${
                        plan.popular 
                          ? 'bg-white text-primary-600 hover:bg-white/90' 
                          : 'bg-primary-400 text-primary-foreground hover:bg-primary-500'
                      }`}
                    >
                      Get Started
                    </Button>
                  </div>

                  {/* Card Body */}
                  <div className="space-y-6 p-3">
                    <p className={`text-xs ${
                      plan.popular ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    }`}>
                      {plan.description}
                    </p>
                    
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className={`flex items-start gap-3 text-sm ${
                          plan.popular ? 'text-primary-foreground/90' : 'text-muted-foreground'
                        }`}>
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${
                            plan.popular ? 'text-primary-foreground' : 'text-primary-500'
                          }`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button variant="outline" size="lg" className="gap-2">
              View Full Plans
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials - Sliding Marquee Design */}
      <section className="py-20 md:py-32 bg-base-50 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-12"
          >
            <Badge className="bg-primary-400 text-primary-foreground border-0">
              Testimonials
            </Badge>
            <h2 className="text-4xl font-medium lg:text-5xl max-w-2xl mx-auto">
              What Our <span className="text-primary-600">Members</span> Say
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Join thousands of successful network builders achieving their financial goals with VSV Unite.
            </p>
          </motion.div>

          {/* Sliding Testimonials Row 1 */}
          <div 
            className="relative overflow-hidden mb-6"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            }}
          >
            <motion.div 
              className="flex gap-6"
              animate={{ x: [0, -1920] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              {[...Array(2)].map((_, setIndex) => (
                <div key={setIndex} className="flex gap-6 shrink-0">
                  {[
                    {
                      quote: "VSV Unite has completely transformed my financial journey. The binary structure is incredibly easy to understand!",
                      name: "Rajesh Kumar",
                      role: "Network Leader",
                      earnings: "₹5L+ Monthly",
                      avatar: "RK",
                      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
                    },
                    {
                      quote: "The real-time wallet updates are amazing. I can see my earnings grow as my team performs.",
                      name: "Priya Sharma",
                      role: "Team Builder",
                      earnings: "₹2L+ Monthly",
                      avatar: "PS",
                      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
                    },
                    {
                      quote: "Started 3 months ago and already earning consistently. The system is truly transparent!",
                      name: "Amit Patel",
                      role: "Professional Member",
                      earnings: "₹50K Monthly",
                      avatar: "AP",
                      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
                    },
                    {
                      quote: "Support team is incredible. They helped me understand everything in just one call!",
                      name: "Sunita Mehta",
                      role: "Starter Member",
                      earnings: "₹25K Monthly",
                      avatar: "SM",
                      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
                    },
                  ].map((testimonial, index) => (
                    <div 
                      key={`${setIndex}-${index}`}
                      className="shrink-0 w-[400px] border border-primary-200 bg-card rounded-2xl overflow-hidden hover:border-primary-400 transition-colors"
                    >
                      <div className="p-6">
                        <p className="text-lg font-light leading-relaxed text-foreground">
                          &ldquo;{testimonial.quote}&rdquo;
                        </p>
                      </div>
                      <div className="border-t border-primary-100 px-6 py-4 flex items-center gap-4">
                        <Avatar className="w-12 h-12 ring-2 ring-primary-200">
                          <AvatarImage src={testimonial.image} alt={testimonial.name} />
                          <AvatarFallback className="bg-primary-200 text-primary-700 font-semibold">
                            {testimonial.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary-600">{testimonial.earnings}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Sliding Testimonials Row 2 - Reverse Direction */}
          <div 
            className="relative overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            }}
          >
            <motion.div 
              className="flex gap-6"
              animate={{ x: [-1920, 0] }}
              transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            >
              {[...Array(2)].map((_, setIndex) => (
                <div key={setIndex} className="flex gap-6 shrink-0">
                  {[
                    {
                      quote: "The PV matching system is completely transparent. No hidden fees, no surprises!",
                      name: "Vikram Singh",
                      role: "Enterprise Member",
                      earnings: "₹8L+ Monthly",
                      avatar: "VS",
                      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces",
                    },
                    {
                      quote: "Best MLM platform I've ever used. The dashboard gives me complete visibility into my network.",
                      name: "Meera Reddy",
                      role: "Team Leader",
                      earnings: "₹3L+ Monthly",
                      avatar: "MR",
                      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
                    },
                    {
                      quote: "Withdrawals are fast and hassle-free. I get my earnings within 24 hours every time.",
                      name: "Arjun Nair",
                      role: "Professional Member",
                      earnings: "₹1L+ Monthly",
                      avatar: "AN",
                      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces",
                    },
                    {
                      quote: "The binary structure makes it so easy to explain to new members. My team is growing fast!",
                      name: "Kavita Joshi",
                      role: "Network Builder",
                      earnings: "₹75K Monthly",
                      avatar: "KJ",
                      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=faces",
                    },
                  ].map((testimonial, index) => (
                    <div 
                      key={`${setIndex}-${index}`}
                      className="shrink-0 w-[400px] border border-primary-200 bg-card rounded-2xl overflow-hidden hover:border-primary-400 transition-colors"
                    >
                      <div className="p-6">
                        <p className="text-lg font-light leading-relaxed text-foreground">
                          &ldquo;{testimonial.quote}&rdquo;
                        </p>
                      </div>
                      <div className="border-t border-primary-100 px-6 py-4 flex items-center gap-4">
                        <Avatar className="w-12 h-12 ring-2 ring-primary-200">
                          <AvatarImage src={testimonial.image} alt={testimonial.name} />
                          <AvatarFallback className="bg-primary-100 text-primary-700 font-semibold">
                            {testimonial.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary-600">{testimonial.earnings}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto"
          >
            {[
              { value: "10,000+", label: "Active Members" },
              { value: "₹50Cr+", label: "Total Payouts" },
              { value: "95%", label: "Success Rate" },
              { value: "24/7", label: "Support Available" },
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-card border border-primary-100 hover:border-primary-300 transition-colors">
                <div className="text-2xl md:text-3xl font-bold text-primary-600">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose VSV Unite - Modern Grid Design */}
      <section className="px-6 py-20 lg:py-40">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex gap-4 flex-col items-start mb-16"
          >
            <Badge className="bg-primary-400 text-primary-foreground border-0">
              Why Choose Us
            </Badge>
            <div className="flex gap-2 flex-col max-w-3xl">
              <h2 className="text-3xl md:text-5xl tracking-tighter font-regular">
                Why Choose <span className="text-primary-600">VSV Unite?</span>
              </h2>
              <p className="text-lg max-w-xl leading-relaxed tracking-tight text-muted-foreground">
                Join thousands of successful members who trust VSV Unite for transparent, automated, and sustainable network income growth.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "100% Transparent",
                description: "Complete visibility into earning rules, PV calculations, and team performance. No hidden terms or surprise deductions.",
                icon: Shield,
              },
              {
                title: "Real-Time Updates",
                description: "Watch your earnings grow instantly with live dashboard updates showing all transactions and team activities.",
                icon: TrendingUp,
              },
              {
                title: "Secure Platform",
                description: "Bank-grade security with encrypted data management and secure payment processing for your peace of mind.",
                icon: Shield,
              },
              {
                title: "Fast Performance",
                description: "High-speed servers ensure smooth experience even during peak hours with instant page loads and quick transactions.",
                icon: BarChart3,
              },
              {
                title: "Easy to Start",
                description: "Perfect for beginners with simple binary structure and comprehensive training materials to get you started quickly.",
                icon: Users,
              },
              {
                title: "24/7 Support",
                description: "Dedicated customer support team available round the clock via WhatsApp, email, and phone to help you succeed.",
                icon: Network,
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="flex flex-row gap-6 items-start p-6 rounded-2xl border border-primary-100 bg-card hover:border-primary-400 hover:shadow-lg transition-all">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-400 group-hover:scale-110 transition-all">
                    <benefit.icon className="w-6 h-6 text-primary-600 group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary-600 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Benefits List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-16 p-8 rounded-2xl bg-primary-50 border border-primary-200"
          >
            <h3 className="text-2xl font-semibold text-center text-foreground mb-8">
              More Reasons to Trust VSV Unite
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {[
                "Transparent PV & Income System",
                "Real-Time Dashboard Insights",
                "Fast & Secure Withdrawals",
                "Strong Referral System",
                "Stable and Sustainable Earnings Model",
                "User-Friendly Platform",
                "Dedicated Member Support",
                "Growing Community Network",
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                  </div>
                  <p className="text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA - Modern Design with Background Image */}
      <section className="relative px-6 py-8 md:py-10 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1080&fit=crop&crop=faces"
            alt="Team Success"
            className="w-full h-full object-cover"
          />
          {/* Lighter overlay with gradient - reduced opacity to show image */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/75 via-primary-500/70 to-primary-400/75" />
        </div>

        {/* Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}
        />
        
        {/* Decorative Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

        <div className="relative mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            {/* Badge */}
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-4">
              Start Your Journey Today
            </Badge>

            {/* Heading */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white max-w-3xl mx-auto leading-tight mb-4">
              Ready to Build Your <br className="hidden sm:block" />
              <span className="text-primary-100">Financial Freedom?</span>
            </h2>

            {/* Description */}
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-6">
              Join 10,000+ successful members who are already earning with VSV Unite&apos;s transparent and automated MLM system.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto py-6">
              {[
                { value: "10K+", label: "Active Members" },
                { value: "₹50Cr+", label: "Paid Out" },
                { value: "95%", label: "Success Rate" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/80 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <Button 
                size="lg" 
                className="gap-2 text-base px-10 py-7 bg-white text-primary-600 hover:bg-white/90 shadow-2xl hover:scale-105 transition-transform font-semibold"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base px-10 py-7 bg-transparent border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm"
              >
                Contact Support
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-wrap items-center justify-center gap-8 mt-8 pt-6 border-t border-white/10 text-white/80 text-sm"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Start in 5 Minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>24/7 Support</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

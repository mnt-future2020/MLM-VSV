"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Users,
  TrendingUp,
  Shield,
  Wallet,
  Network,
  BarChart3,
  Target,
  Eye,
  Heart,
  Zap,
  Clock,
  Headphones,
  RefreshCw,
  Lock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  const offerings = [
    { title: "Membership-based Earning", description: "Structured earning system based on membership tiers", icon: Users },
    { title: "Real-time PV Matching", description: "Instant point value matching and income calculation", icon: Zap },
    { title: "Team Growth Visibility", description: "Complete visibility into your team's performance", icon: TrendingUp },
    { title: "Easy Referral System", description: "Simple tools to invite and manage your referrals", icon: Network },
    { title: "Fast Withdrawals", description: "Quick and secure withdrawal processing", icon: Clock },
    { title: "User-friendly Dashboard", description: "Intuitive interface for managing your business", icon: BarChart3 },
    { title: "Secure Wallet", description: "Safe and encrypted wallet for your earnings", icon: Wallet },
    { title: "24/7 Support System", description: "Round-the-clock customer support", icon: Headphones },
  ];

  const systemSteps = [
    { id: "01", title: "Binary Structure", description: "Every user has a Left & Right team structure for balanced growth.", icon: Network, details: "Build your network with two main branches - left and right. This creates a balanced and sustainable growth pattern." },
    { id: "02", title: "PV (Point Value)", description: "Each plan gives PV; income is based on matching PV from both sides.", icon: BarChart3, details: "Point Values are assigned to each membership plan. Your income is calculated based on matching PVs." },
    { id: "03", title: "Direct Referral Bonus", description: "Earn when your direct member activates a plan.", icon: Users, details: "Get immediate bonuses when people you directly refer activate their membership plans." },
    { id: "04", title: "Matching Income", description: "Earn daily/weekly based on balanced PV from both sides.", icon: TrendingUp, details: "Regular income based on the balanced performance of your left and right teams." },
    { id: "05", title: "Wallet System", description: "Income is added automatically to user wallet.", icon: Wallet, details: "All your earnings are automatically credited to your secure digital wallet in real-time." },
    { id: "06", title: "Withdrawal", description: "Users can request withdrawal anytime after reaching minimum limit.", icon: RefreshCw, details: "Easy withdrawal process once you reach the minimum threshold." },
  ];

  const commitments = [
    { title: "Transparency in Earnings", description: "Every PV point and matching bonus is calculated automatically and visible in your dashboard. No hidden rules or unclear conditions.", icon: Eye },
    { title: "Secure & Reliable Platform", description: "Your data and funds are safe with us. We use secure systems for all transactions and withdrawals.", icon: Shield },
    { title: "Fast Payouts", description: "Withdraw your earnings quickly and conveniently, with minimal processing time.", icon: Clock },
    { title: "Fair and Consistent Income", description: "Our binary PV system ensures consistent earning opportunities for all members based on their activity and team growth.", icon: TrendingUp },
    { title: "Support Whenever You Need It", description: "Our dedicated support team is available to assist you with registration, plan activation, withdrawals, or any technical queries.", icon: Headphones },
    { title: "Growth & Leadership Opportunities", description: "As you build your team, you unlock higher PV, matching income, and leadership rewards — giving you long-term earning potential.", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section - Inspired by MCP Hero with Image Grid */}
      <section className="py-20 lg:py-32 pt-28">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 gap-12 items-center md:grid-cols-2">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex gap-6 flex-col"
            >
              <Badge className="w-fit bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Sparkles className="w-3 h-3 mr-1" />
                About VSV Unite
              </Badge>
              <div className="flex gap-4 flex-col">
                <h1 className="text-4xl md:text-5xl lg:text-6xl max-w-lg tracking-tight text-left font-bold">
                  Built for{" "}
                  <span className="text-primary">Growth</span>, Trust &{" "}
                  <span className="text-primary">Transparency</span>
                </h1>
                <p className="text-lg leading-relaxed text-muted-foreground max-w-md text-left">
                  VSV Unite is created to help individuals build a stable income through a simple
                  and fair binary compensation system. We offer transparency, real-time earnings,
                  and easy tools for building your team.
                </p>
              </div>
              <div className="flex flex-row gap-4 pt-2">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
            </motion.div>

            {/* Right Image Grid */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-square bg-primary/10">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop"
                  alt="Team collaboration"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="relative rounded-2xl overflow-hidden row-span-2 bg-primary/10">
                <Image
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=800&fit=crop"
                  alt="Business growth"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="relative rounded-2xl overflow-hidden aspect-square bg-primary/10">
                <Image
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=400&fit=crop"
                  alt="Success meeting"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section - Modern Split Design */}
      <section className="py-24 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-muted/30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-6 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Our Purpose
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Driving Financial{" "}
              <span className="text-primary">Independence</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Through innovation, trust, and a commitment to your success
            </p>
          </motion.div>

          {/* Main Content - Asymmetric Layout */}
          <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
            {/* Vision Card - Large */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-7"
            >
              <Card className="h-full group overflow-hidden border-0 shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-500">
                <div className="relative h-full min-h-[500px]">
                  {/* Background Image */}
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop"
                    alt="Vision"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-8 lg:p-10 flex flex-col justify-end">
                    {/* Icon */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="mb-6"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>
                    
                    {/* Badge */}
                    <Badge className="w-fit mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-1.5">
                      Our Vision
                    </Badge>
                    
                    {/* Title */}
                    <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                      Where We&apos;re Headed
                    </h3>
                    
                      {/* Quote */}
                    <div className="relative">
                      <div className="absolute -left-4 top-0 text-6xl text-white/20 font-serif">&ldquo;</div>
                      <p className="text-xl lg:text-2xl text-white/90 leading-relaxed pl-4">
                        To become India&apos;s most trusted and scalable MLM platform, fostering a community where members can build sustainable income, develop leadership, and achieve long-term growth through teamwork and transparent earning systems.
                      </p>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex gap-8 mt-8 pt-6 border-t border-white/20">
                      <div>
                        <p className="text-3xl font-bold text-white">10K+</p>
                        <p className="text-sm text-white/70">Active Members</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-white">₹50Cr+</p>
                        <p className="text-sm text-white/70">Paid Out</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-white">4.9★</p>
                        <p className="text-sm text-white/70">User Rating</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Right Column - Mission + Values */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Mission Card */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="flex-1"
              >
                <Card className="h-full group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-card via-card to-primary/5">
                  <div className="relative h-full min-h-[280px]">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary))_1px,transparent_1px)] bg-[size:40px_40px]" />
                    </div>
                    
                    {/* Content */}
                    <div className="relative p-6 lg:p-8 flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/10">
                          <Target className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                        </div>
                        <Badge className="bg-primary text-primary-foreground px-4 py-1.5 shadow-lg shadow-primary/20">
                          Our Mission
                        </Badge>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                        What We Do
                      </h3>
                      
                      {/* Quote Mark */}
                      <div className="relative mb-3">
                        <div className="absolute -left-2 -top-2 text-5xl text-primary/20 font-serif leading-none">&ldquo;</div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-foreground/80 leading-relaxed flex-1 pl-4 text-base">
                        To empower individuals to achieve financial freedom through a transparent, reliable, and easy-to-use binary PV-based network marketing platform. We aim to provide every member with the tools, support, and opportunities to grow their network and income consistently.
                      </p>
                      
                      {/* Key Points */}
                      <div className="mt-6 pt-4 border-t border-primary/10 grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <p className="text-xs font-medium">Empower</p>
                        </div>
                        <div className="text-center">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1">
                            <Shield className="w-4 h-4 text-primary" />
                          </div>
                          <p className="text-xs font-medium">Transparent</p>
                        </div>
                        <div className="text-center">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1">
                            <TrendingUp className="w-4 h-4 text-primary" />
                          </div>
                          <p className="text-xs font-medium">Growth</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Core Values Mini Cards */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-4"
              >
                {/* Trust */}
                <Card className="p-5 group hover:shadow-lg hover:border-primary/30 transition-all duration-300 bg-gradient-to-br from-card to-muted/50">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:scale-110 transition-all">
                    <Shield className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h4 className="font-semibold mb-1">Trust</h4>
                  <p className="text-xs text-muted-foreground">100% transparent operations</p>
                </Card>
                
                {/* Growth */}
                <Card className="p-5 group hover:shadow-lg hover:border-primary/30 transition-all duration-300 bg-gradient-to-br from-card to-muted/50">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:scale-110 transition-all">
                    <TrendingUp className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h4 className="font-semibold mb-1">Growth</h4>
                  <p className="text-xs text-muted-foreground">Continuous improvement</p>
                </Card>
                
                {/* Support */}
                <Card className="p-5 group hover:shadow-lg hover:border-primary/30 transition-all duration-300 bg-gradient-to-br from-card to-muted/50">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:scale-110 transition-all">
                    <Heart className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h4 className="font-semibold mb-1">Support</h4>
                  <p className="text-xs text-muted-foreground">24/7 dedicated help</p>
                </Card>
                
                {/* Innovation */}
                <Card className="p-5 group hover:shadow-lg hover:border-primary/30 transition-all duration-300 bg-gradient-to-br from-card to-muted/50">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:scale-110 transition-all">
                    <Zap className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h4 className="font-semibold mb-1">Innovation</h4>
                  <p className="text-xs text-muted-foreground">Cutting-edge platform</p>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>


      {/* What We Offer Section - Bento Grid Style */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary text-primary-foreground">What We Offer</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Core Offerings for Your Success
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build and manage your network income with complete transparency.
            </p>
          </motion.div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {/* Featured Card - Spans 2 columns */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="md:col-span-2"
            >
              <Card className="h-full overflow-hidden group hover:shadow-xl transition-all border-2 border-transparent hover:border-primary/20">
                <div className="relative h-48">
                  <Image
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop"
                    alt="Dashboard"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <Users className="w-8 h-8 text-white mb-3" />
                    <h3 className="text-xl font-bold text-white">Membership-based Earning</h3>
                    <p className="text-white/80 mt-2">Structured earning system based on membership tiers with transparent calculations</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Regular Cards */}
            {offerings.slice(1, 4).map((offering, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all">
                      <offering.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {offering.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {offering.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Second Row */}
            {offerings.slice(4).map((offering, index) => (
              <motion.div
                key={index + 4}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all">
                      <offering.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {offering.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {offering.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How the System Works - Timeline Style */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary text-primary-foreground">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Understanding Our System
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A detailed breakdown of how our binary compensation system works.
            </p>
          </motion.div>

          {/* Timeline with Image */}
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            {/* Left - Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-square">
                <Image
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=600&fit=crop"
                  alt="Binary System"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Binary Compensation</h3>
                  <p className="text-white/80">Simple, fair, and transparent earning system</p>
                </div>
              </div>
            </motion.div>

            {/* Right - Timeline Steps */}
            <div className="space-y-4">
              {systemSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative flex gap-4"
                >
                  {/* Timeline Line */}
                  {index < systemSteps.length - 1 && (
                    <div className="absolute left-5 top-12 w-0.5 h-full bg-primary/20" />
                  )}
                  
                  {/* Step Number */}
                  <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {step.id}
                  </div>
                  
                  {/* Content */}
                  <Card className="flex-1 group hover:shadow-lg transition-all border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <step.icon className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Our Commitment Section - Grid with Icons */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary text-primary-foreground">Our Commitment</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What We Promise You
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our unwavering commitment to fairness, transparency, and your success.
            </p>
          </motion.div>

          {/* Commitment Grid with Dividers */}
          <div className="relative mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x border rounded-xl overflow-hidden">
            {commitments.map((commitment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-8 text-center group hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                    <commitment.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  {commitment.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {commitment.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Modern Gradient with Glow Effects */}
      <section className="relative overflow-hidden py-8 md:py-10">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-600 to-primary-700" />
        
        {/* Animated Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-300/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-800/30 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-400/20 rounded-full blur-3xl" />
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Join the VSV Unite Community</span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
            >
              Ready to Start Your{" "}
              <span className="relative inline-block">
                Journey?
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="12"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 10C50 2 150 2 198 10"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </svg>
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl mx-auto leading-relaxed"
            >
              Join thousands of successful members who are building their financial future with VSV Unite.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
            >
              <Button
                size="lg"
                className="group relative bg-white text-primary hover:bg-white/90 gap-2 px-8 py-6 text-base font-semibold shadow-2xl shadow-black/20 hover:shadow-white/20 transition-all duration-300"
              >
                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Get Started Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-transparent backdrop-blur-sm px-8 py-6 text-base font-semibold transition-all duration-300"
                asChild
              >
                <Link href="/#contact">Contact Us</Link>
              </Button>
            </motion.div>

            {/* Stats/Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-8 pt-6 border-t border-white/10"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-white/20 border-2 border-primary flex items-center justify-center"
                    >
                      <Users className="w-4 h-4 text-white" />
                    </div>
                  ))}
                </div>
                <span className="text-sm text-white/80 font-medium">10,000+ Active Members</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-white/80" />
                <span className="text-sm text-white/80 font-medium">100% Secure Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white/80" />
                <span className="text-sm text-white/80 font-medium">Trusted Across India</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

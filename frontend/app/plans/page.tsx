"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Check,
  X,
  ArrowRight,
  Sparkles,
  Crown,
  Zap,
  Star,
  TrendingUp,
  Users,
  Shield,
  Headphones,
  Network,
  Gift,
  Award,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PlansPage() {
  const plans = [
    {
      name: "Basic",
      price: "₹111",
      period: "one-time",
      pv: "PV 1",
      incomeStart: "₹25",
      dailyCapping: "₹250/day",
      binaryCondition: "Left 10 - Right 10 = ₹250",
      description: "A perfect starter plan for new members who want to experience the system and begin earning with a small, risk-free investment.",
      icon: Users,
      popular: false,
      features: [
        "Entry into the binary network",
        "PV benefits to start earning",
        "Eligibility for matching income",
        "Full access to dashboard & referral link",
        "Daily capping: ₹250",
        "Binary matching: Left 10 - Right 10",
      ],
      notIncluded: [
        "Higher PV benefits",
        "Priority support",
        "Advanced features",
      ],
    },
    {
      name: "Standard",
      price: "₹599",
      period: "one-time",
      pv: "PV 2",
      incomeStart: "₹50",
      dailyCapping: "₹500/day",
      binaryCondition: "Left 10 - Right 10 = ₹500",
      description: "A balanced plan designed for members who want stronger PV value, higher income potential, and faster team growth opportunities.",
      icon: Zap,
      popular: true,
      features: [
        "Increased PV for higher matching earnings",
        "Better daily income opportunities",
        "Priority in binary matching",
        "Complete access to wallet, reports, and team structure",
        "Daily capping: ₹500",
        "Binary matching: Left 10 - Right 10",
      ],
      notIncluded: [
        "Maximum PV benefits",
        "Premium features",
      ],
    },
    {
      name: "Advanced",
      price: "₹1,199",
      period: "one-time",
      pv: "PV 4",
      incomeStart: "₹100",
      dailyCapping: "₹1,000/day",
      binaryCondition: "Left 10 - Right 10 = ₹1,000",
      description: "A powerful plan crafted for serious builders aiming for higher capping, stronger binary performance, and maximum team benefits.",
      icon: TrendingUp,
      popular: false,
      features: [
        "High PV score for stronger matching",
        "Greater daily capping limits",
        "Faster income growth with team building",
        "Advanced earning features and priority support",
        "Daily capping: ₹1,000",
        "Binary matching: Left 10 - Right 10",
      ],
      notIncluded: [
        "Top-tier PV benefits",
      ],
    },
    {
      name: "Premium",
      price: "₹1,799",
      period: "one-time",
      pv: "PV 6",
      incomeStart: "₹150",
      dailyCapping: "₹1,500/day",
      binaryCondition: "Left 10 - Right 10 = ₹1,500",
      description: "The highest earning plan with maximum PV power, top binary rewards, and the best daily earning potential for committed leaders.",
      icon: Crown,
      popular: false,
      features: [
        "Maximum PV for top-tier earnings",
        "Best daily capping limit",
        "Highest binary income potential",
        "Premium system features & exclusive advantages",
        "Daily capping: ₹1,500",
        "Binary matching: Left 10 - Right 10",
      ],
      notIncluded: [],
    },
  ];

  const comparisonFeatures = [
    { name: "Plan Amount", basic: "₹111", standard: "₹599", advanced: "₹1,199", premium: "₹1,799" },
    { name: "Point Value (PV)", basic: "PV 1", standard: "PV 2", advanced: "PV 4", premium: "PV 6" },
    { name: "Income Start", basic: "₹25", standard: "₹50", advanced: "₹100", premium: "₹150" },
    { name: "Daily Capping", basic: "₹250", standard: "₹500", advanced: "₹1,000", premium: "₹1,500" },
    { name: "Binary Condition", basic: "L10-R10=₹250", standard: "L10-R10=₹500", advanced: "L10-R10=₹1K", premium: "L10-R10=₹1.5K" },
    { name: "Binary Network Access", basic: true, standard: true, advanced: true, premium: true },
    { name: "Dashboard & Reports", basic: true, standard: true, advanced: true, premium: true },
    { name: "Referral Link", basic: true, standard: true, advanced: true, premium: true },
    { name: "Priority Support", basic: false, standard: true, advanced: true, premium: true },
    { name: "Premium Features", basic: false, standard: false, advanced: true, premium: true },
  ];

  const faqs = [
    {
      id: "item-1",
      question: "What is PV?",
      answer: "PV (Point Value) is the value assigned to each plan. When your left and right teams generate PV, these points are matched and converted into your earnings.",
    },
    {
      id: "item-2",
      question: "How does matching income work?",
      answer: "Matching income is earned when your Left PV and Right PV match. For example: If your left and right teams both generate the required PV for your plan, you receive the matching income for that cycle.",
    },
    {
      id: "item-3",
      question: "Can I upgrade my plan?",
      answer: "Yes, you can upgrade anytime by paying the difference amount. Upgrading increases your PV, daily earning limit, and overall income potential.",
    },
    {
      id: "item-4",
      question: "How many referrals do I need?",
      answer: "You only need two direct referrals — one on your Left side and one on your Right side — to start building your binary network and earning matching bonuses.",
    },
    {
      id: "item-5",
      question: "What is the minimum withdrawal?",
      answer: "The minimum withdrawal amount is set by the company. Once your wallet balance reaches this amount, you can submit a withdrawal request.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section - Modern Split Design */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1920&h=1080&fit=crop"
            alt="Pricing Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        </div>

        {/* Animated Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-20 right-[20%] w-72 h-72 bg-primary/20 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
            className="absolute bottom-20 right-[30%] w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Simple & Transparent Pricing
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Choose the Right Plan.{" "}
                <span className="text-primary relative">
                  Unlock
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C50 4 150 4 198 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary/40"/>
                  </svg>
                </span>{" "}
                Your Earning Potential.
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                One-time investment plans with lifetime benefits. Start earning from day one with our binary matching system. Choose the plan that fits your goals.
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">10,000+</p>
                    <p className="text-xs text-muted-foreground">Active Users</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">₹50Cr+</p>
                    <p className="text-xs text-muted-foreground">Paid Out</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">4.9/5</p>
                    <p className="text-xs text-muted-foreground">User Rating</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/25" asChild>
                  <Link href="/register">
                    <Zap className="w-5 h-5" />
                    Get Started Now
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  Compare All Plans
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Trust Badge */}
              <p className="text-sm text-muted-foreground mt-6 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                One-time payment • Lifetime access • Binary matching system
              </p>
            </motion.div>

            {/* Right - Floating Price Cards Preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Background Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="absolute top-8 -left-4 w-64 bg-card border rounded-2xl p-6 shadow-xl opacity-60"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">Basic</p>
                      <p className="text-sm text-muted-foreground">₹111 • PV 1</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Daily Capping: ₹250</div>
                    <div className="h-2 bg-muted rounded-full w-full" />
                  </div>
                </motion.div>

                {/* Main Featured Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="relative z-10 ml-12 w-72 bg-card border-2 border-primary rounded-2xl p-6 shadow-2xl shadow-primary/20"
                >
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Most Popular
                  </Badge>
                  <div className="flex items-center gap-3 mb-4 mt-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Standard</p>
                      <p className="text-primary font-bold">₹599 • PV 2</p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    {["Income Start: ₹50", "Daily Capping: ₹500", "Priority Matching", "Binary: L10-R10"].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" size="sm" asChild>
                    <Link href="/register">Get Started</Link>
                  </Button>
                </motion.div>

                {/* Third Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="absolute -bottom-4 right-0 w-56 bg-card border rounded-2xl p-5 shadow-xl opacity-70"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                      <Crown className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Premium</p>
                      <p className="text-xs text-muted-foreground">₹1,799 • PV 6</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Daily: ₹1,500</div>
                    <div className="h-2 bg-muted rounded-full w-full" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

      
      </section>

      {/* Pricing Cards Section - Enhanced Alternating Layout */}
      <section className="py-24 px-6 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Our Plans
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Choose Your Perfect Plan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each plan is designed to help you succeed at different stages of your network marketing journey.
            </p>
          </motion.div>

          <div className="space-y-24">
            {plans.map((plan, index) => {
              const isEven = index % 2 === 0;
              const planImages = [
                "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
                "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop",
              ];
              const planHighlights = [
                "Entry Level",
                "Most Popular",
                "Growth Focused",
                "Top Tier",
              ];
              
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="relative"
                >
                  {/* Decorative Background */}
                  {plan.popular && (
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl blur-xl" />
                  )}
                  
                  <div className={`relative grid lg:grid-cols-2 gap-8 lg:gap-0 items-center ${!isEven ? "lg:grid-flow-col-dense" : ""}`}>
                    {/* Image Section */}
                    <motion.div 
                      className={`relative ${!isEven ? "lg:col-start-2 lg:pl-8" : "lg:pr-8"}`}
                      initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <div className="relative group">
                        {/* Main Image Container */}
                        <div className={`relative rounded-3xl overflow-hidden shadow-2xl ${plan.popular ? "shadow-primary/20" : "shadow-black/10"}`}>
                          <div className="aspect-[4/3] relative">
                            <Image
                              src={planImages[index]}
                              alt={`${plan.name} Plan`}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-1000"
                            />
                            {/* Gradient Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            <div className={`absolute inset-0 bg-gradient-to-${isEven ? "r" : "l"} from-transparent via-transparent to-black/30`} />
                          </div>
                          
                          {/* Popular Badge */}
                          {plan.popular && (
                            <motion.div 
                              className="absolute top-6 left-6"
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.4, delay: 0.5 }}
                              viewport={{ once: true }}
                            >
                              <Badge className="bg-white text-primary px-5 py-2.5 shadow-xl font-bold text-sm">
                                <Star className="w-4 h-4 mr-2 fill-primary" />
                                Most Popular
                              </Badge>
                            </motion.div>
                          )}
                          
                          {/* Price Card Overlay */}
                          <div className="absolute bottom-6 left-6 right-6">
                            <motion.div 
                              className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 shadow-xl"
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.4 }}
                              viewport={{ once: true }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`w-14 h-14 rounded-2xl ${plan.popular ? "bg-white/30" : "bg-white/20"} flex items-center justify-center`}>
                                    <plan.icon className="w-7 h-7 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                                    <p className="text-white/70 text-sm">{planHighlights[index]}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex flex-col items-end">
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-3xl font-black text-white">{plan.price}</span>
                                    </div>
                                    <span className="text-white/70 text-xs">{plan.pv}</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                        
                        {/* Floating Decorative Element */}
                        <div className={`absolute ${isEven ? "-right-4 -bottom-4" : "-left-4 -bottom-4"} w-24 h-24 bg-primary/20 rounded-full blur-2xl`} />
                      </div>
                    </motion.div>

                    {/* Content Section */}
                    <motion.div 
                      className={`${!isEven ? "lg:col-start-1 lg:pr-8" : "lg:pl-8"}`}
                      initial={{ opacity: 0, x: isEven ? 40 : -40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <Card className={`p-8 lg:p-10 ${plan.popular ? "border-2 border-primary/30 bg-card/80 backdrop-blur-sm" : "border bg-card/50"}`}>
                        {/* Plan Header */}
                        <div className="mb-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl ${plan.popular ? "bg-primary/20" : "bg-muted"} flex items-center justify-center`}>
                              <plan.icon className={`w-5 h-5 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">{plan.name} Plan</h3>
                              <p className="text-sm text-muted-foreground">{plan.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Plan Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/30 rounded-xl">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Income Start</p>
                            <p className="text-lg font-bold text-primary">{plan.incomeStart}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Daily Capping</p>
                            <p className="text-lg font-bold">{plan.dailyCapping}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground mb-1">Binary Condition</p>
                            <p className="text-sm font-semibold">{plan.binaryCondition}</p>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-muted-foreground leading-relaxed mb-8 text-sm">
                          {plan.description}
                        </p>

                        {/* Features List */}
                        <div className="mb-8">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">What&apos;s included</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {plan.features.map((feature, i) => (
                              <motion.div 
                                key={i} 
                                className="flex items-center gap-3 group/feature"
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                                viewport={{ once: true }}
                              >
                                <div className={`w-6 h-6 rounded-full ${plan.popular ? "bg-primary/20" : "bg-muted"} flex items-center justify-center shrink-0 group-hover/feature:scale-110 transition-transform`}>
                                  <Check className={`w-3.5 h-3.5 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                                </div>
                                <span className="text-sm">{feature}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Not Included */}
                        {plan.notIncluded.length > 0 && (
                          <div className="mb-8 pt-6 border-t border-dashed">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Not included</p>
                            <div className="flex flex-wrap gap-3">
                              {plan.notIncluded.map((feature, i) => (
                                <span key={i} className="text-sm text-muted-foreground/60 flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                                  <X className="w-3.5 h-3.5" />
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* CTA Button */}
                        <Button
                          size="lg"
                          className={`w-full group/btn text-base py-6 ${
                            plan.popular
                              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                              : ""
                          }`}
                          variant={plan.popular ? "default" : "outline"}
                        >
                          Get Started with {plan.name}
                          <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                        
                        <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
                          <Zap className="w-4 h-4 text-primary" />
                          One-time payment • Lifetime access
                        </p>
                      </Card>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Comparison Table Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-primary text-primary-foreground">Feature Comparison</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Compare All Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Detailed comparison of features across all plans to help you make the right choice.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold">Features</th>
                      <th className="text-center p-4 font-semibold">Basic</th>
                      <th className="text-center p-4 font-semibold bg-primary/5">
                        <div className="flex items-center justify-center gap-2">
                          Standard
                          <Star className="w-4 h-4 text-primary" />
                        </div>
                      </th>
                      <th className="text-center p-4 font-semibold">Advanced</th>
                      <th className="text-center p-4 font-semibold">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, index) => (
                      <tr
                        key={feature.name}
                        className={`border-b ${index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                      >
                        <td className="p-4 font-medium">{feature.name}</td>
                        <td className="p-4 text-center">
                          {typeof feature.basic === "boolean" ? (
                            feature.basic ? (
                              <Check className="w-5 h-5 text-primary mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{feature.basic}</span>
                          )}
                        </td>
                        <td className="p-4 text-center bg-primary/5">
                          {typeof feature.standard === "boolean" ? (
                            feature.standard ? (
                              <Check className="w-5 h-5 text-primary mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            <span className="text-sm font-medium">{feature.standard}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.advanced === "boolean" ? (
                            feature.advanced ? (
                              <Check className="w-5 h-5 text-primary mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{feature.advanced}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.premium === "boolean" ? (
                            feature.premium ? (
                              <Check className="w-5 h-5 text-primary mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{feature.premium}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section with Images */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary text-primary-foreground">Why Choose Us</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Your Success
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every plan comes with powerful features designed to help you grow your network and maximize earnings.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="relative rounded-2xl overflow-hidden aspect-square">
                <Image
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=600&fit=crop"
                  alt="Team Success"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Real-Time Analytics</h3>
                  <p className="text-white/80">Track your team&apos;s performance and earnings in real-time</p>
                </div>
              </div>
            </motion.div>

            {/* Right - Benefits List */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {[
                { icon: TrendingUp, title: "Maximize Earnings", description: "Advanced PV matching system ensures fair and transparent income distribution" },
                { icon: Shield, title: "Secure Platform", description: "Bank-level security with encrypted transactions and data protection" },
                { icon: Headphones, title: "24/7 Support", description: "Dedicated support team available round the clock to help you succeed" },
                { icon: Network, title: "Easy Team Building", description: "Intuitive tools to invite, manage, and grow your network effortlessly" },
              ].map((benefit, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-primary text-primary-foreground">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Find answers to common questions about our pricing and plans.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Accordion
              type="single"
              collapsible
              className="bg-background rounded-2xl border shadow-sm"
            >
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="border-b last:border-0 px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="font-semibold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <p className="text-center text-muted-foreground mt-8">
              Still have questions?{" "}
              <Link href="/contact" className="text-primary font-medium hover:underline">
                Contact our support team
              </Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 md:py-10 px-6 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-600 to-primary-700" />
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-400/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Start Your 14-Day Free Trial
            </h2>
            <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
              No credit card required. Experience all Pro features free for 14 days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2">
                <Zap className="w-5 h-5" />
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                asChild
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2 text-white/80">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Users className="w-5 h-5" />
                <span className="text-sm">10,000+ Members</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Award className="w-5 h-5" />
                <span className="text-sm">Trusted Platform</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { Save, Building2, Search, Image as ImageIcon, Plus, Trash2, ChevronUp, ChevronDown, Settings as SettingsIcon, Loader2, Mail, Send, Award } from "lucide-react";
import { toast } from "sonner";
import { getSettings, updateGeneralSettings, updateSeoSettings, updateHeroSettings } from "@/lib/settings-api";
import { getEmailConfiguration, updateEmailConfiguration, testEmailConfiguration } from "@/lib/email-config-api";
import { ImageUpload } from "@/components/ui/image-upload";
import { RanksTab } from "@/components/settings/RanksTab";

type TabType = "general" | "seo" | "hero" | "email" | "ranks";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentSystemTime, setCurrentSystemTime] = useState("");

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    companyName: "VSV Unite",
    companyEmail: "info@vsvunite.com",
    companyPhone: "+91 1234567890",
    companyAddress: "123 Business Street, City, State, PIN",
    companyDescription: "A transparent, automated MLM system built on Binary + PV earning model",
    minimumWithdrawLimit: "1000", // Minimum withdrawal amount
    systemTimeOffset: "0", // Time offset in minutes (+/- from actual time)
    eodTime: "23:59", // End of Day time for calculations
  });

  // SEO Settings State
  const [seoSettings, setSeoSettings] = useState({
    metaTitle: "VSV Unite - Grow Your Network, Grow Your Income",
    metaDescription: "Join VSV Unite's transparent MLM platform with Binary + PV earning model",
    metaKeywords: "MLM, network marketing, binary plan, VSV Unite",
    ogImage: "/assets/images/og-image.jpg",
  });

  // Hero Section State - Multiple Slides
  const [heroSettings, setHeroSettings] = useState({
    badge: "Transparent MLM Platform • Binary + PV System",
    slides: [
      {
        headline: "Build Your Network. Unlock Unlimited Income.",
        subHeadline: "Join VSV Unite Marketing and start earning through our transparent PV-based binary model. Grow your left & right teams and watch your income multiply.",
        highlights: ["Simple Registration", "Instant Referral Bonuses", "Automated PV Matching Income"],
        ctaPrimary: "Join Now",
        ctaSecondary: "View Plans",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
      },
      {
        headline: "Achieve More With Smart Binary PV Earnings",
        subHeadline: "Activate your membership, share your referral link, and earn matching bonuses as your team expands. Your success starts with a single step.",
        highlights: ["Real-Time PV Tracking", "Direct & Matching Income", "Secure Wallet & Fast Payouts"],
        ctaPrimary: "Activate Membership",
        ctaSecondary: "Check Earnings",
        image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop"
      },
      {
        headline: "Your Path to Financial Freedom Starts Here",
        subHeadline: "A trusted membership platform designed to help you build, grow, and earn consistently with a sustainable binary network.",
        highlights: ["Transparent System", "Easy-to-Use Dashboard", "24/7 Member Support"],
        ctaPrimary: "Get Started",
        ctaSecondary: "Learn More",
        image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2074&auto=format&fit=crop"
      }
    ]
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Email Configuration State
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    senderEmail: "",
  });

  const [testEmail, setTestEmail] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
    // Fetch system time periodically
    const fetchSystemTime = async () => {
      try {
        const response = await axiosInstance.get('/api/system/time');
        if (response.data.success) {
          setCurrentSystemTime(response.data.data.currentTimeFormatted);
        }
      } catch (error) {
        console.error("Error fetching system time:", error);
      }
    };
    fetchSystemTime();
    const interval = setInterval(fetchSystemTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getSettings();
      if (response.success && response.data) {
        const data = response.data;
        
        // Update general settings
        setGeneralSettings({
          companyName: data.companyName || "VSV Unite",
          companyEmail: data.companyEmail || "info@vsvunite.com",
          companyPhone: data.companyPhone || "+91 1234567890",
          companyAddress: data.companyAddress || "123 Business Street, City, State, PIN",
          companyDescription: data.companyDescription || "A transparent, automated MLM system built on Binary + PV earning model",
          minimumWithdrawLimit: data.minimumWithdrawLimit || "1000",
          systemTimeOffset: data.systemTimeOffset || "0",
          eodTime: data.eodTime || "23:59",
        });

        // Update SEO settings
        setSeoSettings({
          metaTitle: data.metaTitle || "VSV Unite - Grow Your Network, Grow Your Income",
          metaDescription: data.metaDescription || "Join VSV Unite's transparent MLM platform with Binary + PV earning model",
          metaKeywords: data.metaKeywords || "MLM, network marketing, binary plan, VSV Unite",
          ogImage: data.ogImage || "/assets/images/og-image.jpg",
        });

        // Update hero settings
        if (data.heroBadge || data.heroSlides) {
          setHeroSettings({
            badge: data.heroBadge || "Transparent MLM Platform • Binary + PV System",
            slides: data.heroSlides && data.heroSlides.length > 0 ? data.heroSlides : heroSettings.slides,
          });
        }
      }

      // Fetch email configuration separately
      try {
        const emailResponse = await getEmailConfiguration();
        if (emailResponse.success && emailResponse.emailConfig) {
          setEmailSettings({
            smtpHost: emailResponse.emailConfig.smtpHost || "smtp.gmail.com",
            smtpPort: emailResponse.emailConfig.smtpPort || "587",
            smtpUsername: emailResponse.emailConfig.smtpUsername || "",
            smtpPassword: emailResponse.emailConfig.smtpPassword || "",
            senderEmail: emailResponse.emailConfig.senderEmail || "",
          });
        }
      } catch (emailError: any) {
        console.error("Failed to fetch email config:", emailError);
        // Don't show error toast for email config as it's optional
      }
    } catch (error: any) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings", {
        description: error.response?.data?.message || "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let response;
      
      // Save based on active tab
      if (activeTab === "general") {
        response = await updateGeneralSettings(generalSettings);
      } else if (activeTab === "seo") {
        response = await updateSeoSettings(seoSettings);
      } else if (activeTab === "hero") {
        response = await updateHeroSettings({
          heroBadge: heroSettings.badge,
          heroSlides: heroSettings.slides,
        });
      } else if (activeTab === "email") {
        response = await updateEmailConfiguration(emailSettings);
      }

      if (response?.success) {
        toast.success("Settings saved successfully!", {
          description: "Your changes have been applied.",
        });
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error("Failed to save settings", {
        description: error.response?.data?.message || "Please try again later.",
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general" as TabType, label: "General", icon: Building2 },
    { id: "seo" as TabType, label: "SEO Settings", icon: Search },
    { id: "hero" as TabType, label: "Hero Section", icon: ImageIcon },
    { id: "email" as TabType, label: "Email Configuration", icon: Mail },
    { id: "ranks" as TabType, label: "Rank Management", icon: Award },
  ];

  if (loading) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="full">
      <PageHeader
        icon={<SettingsIcon className="w-6 h-6 text-white" />}
        title="Settings"
        subtitle="Manage your application settings and configurations"
        action={
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-400 hover:bg-primary-500 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        }
      />

      {/* Tabs */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-border bg-muted/30">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "text-primary-600 border-b-2 border-primary-600 bg-card"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Company Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={generalSettings.companyName}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            companyName: e.target.value,
                          })
                        }
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="companyEmail">Company Email</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={generalSettings.companyEmail}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            companyEmail: e.target.value,
                          })
                        }
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="companyPhone">Company Phone</Label>
                      <Input
                        id="companyPhone"
                        value={generalSettings.companyPhone}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            companyPhone: e.target.value,
                          })
                        }
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="companyAddress">Company Address</Label>
                      <Input
                        id="companyAddress"
                        value={generalSettings.companyAddress}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            companyAddress: e.target.value,
                          })
                        }
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="minimumWithdrawLimit">Minimum Withdraw Limit (₹)</Label>
                      <Input
                        id="minimumWithdrawLimit"
                        type="number"
                        value={generalSettings.minimumWithdrawLimit}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            minimumWithdrawLimit: e.target.value,
                          })
                        }
                        className="mt-2"
                        placeholder="1000"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Minimum amount users can withdraw (default: ₹1000)
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="companyDescription">
                        Company Description
                      </Label>
                      <Textarea
                        id="companyDescription"
                        value={generalSettings.companyDescription}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            companyDescription: e.target.value,
                          })
                        }
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

              {/* System Time Settings */}
              <div className="mt-8 pt-6 border-t border-border">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-500" />
                  System Time Settings
                </h2>
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary-700 font-medium">Current System Time (IST)</p>
                      <p className="text-2xl font-bold text-primary-900">{currentSystemTime || "Loading..."}</p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="systemTimeOffset">Time Offset (Minutes)</Label>
                    <Input
                      id="systemTimeOffset"
                      type="number"
                      value={generalSettings.systemTimeOffset}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          systemTimeOffset: e.target.value,
                        })
                      }
                      className="mt-2"
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Adjust system time (+/- minutes). Example: +30 means 30 mins ahead
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="eodTime">End of Day (EOD) Time</Label>
                    <Input
                      id="eodTime"
                      type="time"
                      value={generalSettings.eodTime}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          eodTime: e.target.value,
                        })
                      }
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Time when PV matching, carry forward calculations run (default: 23:59)
                    </p>
                  </div>
                </div>
              </div>
              </div>
            )}

          {/* SEO Tab */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  SEO Configuration
                </h2>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={seoSettings.metaTitle}
                      onChange={(e) =>
                        setSeoSettings({
                          ...seoSettings,
                          metaTitle: e.target.value,
                        })
                      }
                      className="mt-2"
                      placeholder="Your page title for search engines"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 50-60 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={seoSettings.metaDescription}
                      onChange={(e) =>
                        setSeoSettings({
                          ...seoSettings,
                          metaDescription: e.target.value,
                        })
                      }
                      rows={3}
                      className="mt-2"
                      placeholder="Brief description for search results"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 150-160 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="metaKeywords">Meta Keywords</Label>
                    <Input
                      id="metaKeywords"
                      value={seoSettings.metaKeywords}
                      onChange={(e) =>
                        setSeoSettings({
                          ...seoSettings,
                          metaKeywords: e.target.value,
                        })
                      }
                      className="mt-2"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Separate keywords with commas
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="ogImage">Open Graph Image</Label>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">
                      Image shown when sharing on social media (1200x630px recommended)
                    </p>
                    <ImageUpload
                      value={seoSettings.ogImage}
                      onChange={(base64OrUrl) =>
                        setSeoSettings({
                          ...seoSettings,
                          ogImage: base64OrUrl,
                        })
                      }
                      folder="og-images"
                      label="Upload OG Image"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hero Section Tab */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Home Page Hero Section - Carousel Slides
                </h2>

                {/* Badge Text */}
                <div className="mb-6">
                  <Label htmlFor="heroBadge">Hero Badge Text</Label>
                  <Input
                    id="heroBadge"
                    value={heroSettings.badge}
                    onChange={(e) =>
                      setHeroSettings({
                        ...heroSettings,
                        badge: e.target.value,
                      })
                    }
                    className="mt-2"
                    placeholder="Transparent MLM Platform • Binary + PV System"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Badge shown above the headline
                  </p>
                </div>

                {/* Slide Selector with Actions */}
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  {heroSettings.slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlideIndex(index)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentSlideIndex === index
                          ? "bg-primary-400 text-white"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      Slide {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const newSlide = {
                        headline: "New Slide Headline",
                        subHeadline: "Add your description here",
                        highlights: ["Feature 1", "Feature 2", "Feature 3"],
                        ctaPrimary: "Get Started",
                        ctaSecondary: "Learn More",
                        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
                      };
                      setHeroSettings({
                        ...heroSettings,
                        slides: [...heroSettings.slides, newSlide]
                      });
                      setCurrentSlideIndex(heroSettings.slides.length);
                      toast.success("New slide added", {
                        description: `Slide ${heroSettings.slides.length + 1} has been created.`,
                      });
                    }}
                    className="px-4 py-2 rounded-lg font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Slide
                  </button>
                </div>

                {/* Current Slide Editor */}
                <div className="space-y-6 p-6 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">
                      Editing Slide {currentSlideIndex + 1} of {heroSettings.slides.length}
                    </h3>
                    <div className="flex items-center gap-2">
                      {/* Move Up */}
                      <button
                        onClick={() => {
                          if (currentSlideIndex > 0) {
                            const newSlides = [...heroSettings.slides];
                            [newSlides[currentSlideIndex], newSlides[currentSlideIndex - 1]] = 
                            [newSlides[currentSlideIndex - 1], newSlides[currentSlideIndex]];
                            setHeroSettings({ ...heroSettings, slides: newSlides });
                            setCurrentSlideIndex(currentSlideIndex - 1);
                            toast.success("Slide moved up");
                          }
                        }}
                        disabled={currentSlideIndex === 0}
                        className="p-2 rounded-lg bg-card border border-border hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move slide up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      {/* Move Down */}
                      <button
                        onClick={() => {
                          if (currentSlideIndex < heroSettings.slides.length - 1) {
                            const newSlides = [...heroSettings.slides];
                            [newSlides[currentSlideIndex], newSlides[currentSlideIndex + 1]] = 
                            [newSlides[currentSlideIndex + 1], newSlides[currentSlideIndex]];
                            setHeroSettings({ ...heroSettings, slides: newSlides });
                            setCurrentSlideIndex(currentSlideIndex + 1);
                            toast.success("Slide moved down");
                          }
                        }}
                        disabled={currentSlideIndex === heroSettings.slides.length - 1}
                        className="p-2 rounded-lg bg-card border border-border hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move slide down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (heroSettings.slides.length > 1) {
                            const newSlides = heroSettings.slides.filter((_, i) => i !== currentSlideIndex);
                            setHeroSettings({ ...heroSettings, slides: newSlides });
                            setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
                            toast.success("Slide deleted", {
                              description: `Slide ${currentSlideIndex + 1} has been removed.`,
                            });
                          } else {
                            toast.error("Cannot delete slide", {
                              description: "You must have at least one slide!",
                            });
                          }
                        }}
                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
                        title="Delete slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                    <div>
                      <Label>Headline</Label>
                      <Input
                        value={heroSettings.slides[currentSlideIndex].headline}
                        onChange={(e) => {
                          const newSlides = [...heroSettings.slides];
                          newSlides[currentSlideIndex].headline = e.target.value;
                          setHeroSettings({ ...heroSettings, slides: newSlides });
                        }}
                        className="mt-2"
                        placeholder="Main headline"
                      />
                    </div>

                    <div>
                      <Label>Sub-Headline</Label>
                      <Textarea
                        value={heroSettings.slides[currentSlideIndex].subHeadline}
                        onChange={(e) => {
                          const newSlides = [...heroSettings.slides];
                          newSlides[currentSlideIndex].subHeadline = e.target.value;
                          setHeroSettings({ ...heroSettings, slides: newSlides });
                        }}
                        rows={3}
                        className="mt-2"
                        placeholder="Supporting text"
                      />
                    </div>

                    <div>
                      <Label>Highlights (comma-separated)</Label>
                      <Input
                        value={heroSettings.slides[currentSlideIndex].highlights.join(", ")}
                        onChange={(e) => {
                          const newSlides = [...heroSettings.slides];
                          newSlides[currentSlideIndex].highlights = e.target.value.split(",").map(h => h.trim());
                          setHeroSettings({ ...heroSettings, slides: newSlides });
                        }}
                        className="mt-2"
                        placeholder="Feature 1, Feature 2, Feature 3"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Primary Button Text</Label>
                        <Input
                          value={heroSettings.slides[currentSlideIndex].ctaPrimary}
                          onChange={(e) => {
                            const newSlides = [...heroSettings.slides];
                            newSlides[currentSlideIndex].ctaPrimary = e.target.value;
                            setHeroSettings({ ...heroSettings, slides: newSlides });
                          }}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Secondary Button Text</Label>
                        <Input
                          value={heroSettings.slides[currentSlideIndex].ctaSecondary}
                          onChange={(e) => {
                            const newSlides = [...heroSettings.slides];
                            newSlides[currentSlideIndex].ctaSecondary = e.target.value;
                            setHeroSettings({ ...heroSettings, slides: newSlides });
                          }}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Background Image</Label>
                      <p className="text-xs text-muted-foreground mt-1 mb-3">
                        Upload hero slide background image (2070x1380px recommended)
                      </p>
                      <ImageUpload
                        key={`hero-slide-${currentSlideIndex}`}
                        value={heroSettings.slides[currentSlideIndex].image}
                        onChange={(base64OrUrl) => {
                          const newSlides = [...heroSettings.slides];
                          newSlides[currentSlideIndex].image = base64OrUrl;
                          setHeroSettings({ ...heroSettings, slides: newSlides });
                        }}
                        folder="hero-slides"
                        label="Upload Hero Background"
                      />
                    </div>
                  </div>

                {/* Preview */}
                <div className="mt-6 p-6 bg-gray-900 rounded-lg">
                  <h3 className="text-sm font-semibold text-white mb-4">
                    Preview - Slide {currentSlideIndex + 1}
                  </h3>
                  <div className="relative rounded-lg overflow-hidden" style={{
                    backgroundImage: `url(${heroSettings.slides[currentSlideIndex].image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}>
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="relative p-12 text-center text-white">
                      <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm mb-4">
                        {heroSettings.badge}
                      </div>
                      <h1 className="text-4xl font-bold mb-4">
                        {heroSettings.slides[currentSlideIndex].headline}
                      </h1>
                      <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
                        {heroSettings.slides[currentSlideIndex].subHeadline}
                      </p>
                      <div className="flex flex-wrap justify-center gap-3 mb-6">
                        {heroSettings.slides[currentSlideIndex].highlights.map((highlight, i) => (
                          <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm border border-white/20">
                            ✓ {highlight}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-4 justify-center">
                        <button className="px-6 py-3 bg-primary-400 text-white rounded-lg font-semibold">
                          {heroSettings.slides[currentSlideIndex].ctaPrimary}
                        </button>
                        <button className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg font-semibold">
                          {heroSettings.slides[currentSlideIndex].ctaSecondary}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Configuration Tab */}
          {activeTab === "email" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Email Configuration
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Configure SMTP settings for sending emails from the platform
                </p>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={emailSettings.smtpHost}
                        onChange={(e) =>
                          setEmailSettings({
                            ...emailSettings,
                            smtpHost: e.target.value,
                          })
                        }
                        className="mt-2"
                        placeholder="smtp.gmail.com"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        SMTP server hostname
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        value={emailSettings.smtpPort}
                        onChange={(e) =>
                          setEmailSettings({
                            ...emailSettings,
                            smtpPort: e.target.value,
                          })
                        }
                        className="mt-2"
                        placeholder="587"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Usually 587 for TLS or 465 for SSL
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="smtpUsername">SMTP Username</Label>
                      <Input
                        id="smtpUsername"
                        value={emailSettings.smtpUsername}
                        onChange={(e) =>
                          setEmailSettings({
                            ...emailSettings,
                            smtpUsername: e.target.value,
                          })
                        }
                        className="mt-2"
                        placeholder="your-email@gmail.com"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        SMTP authentication username
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={(e) =>
                          setEmailSettings({
                            ...emailSettings,
                            smtpPassword: e.target.value,
                          })
                        }
                        className="mt-2"
                        placeholder="••••••••••••••••"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        For Gmail, use App Password if 2FA is enabled
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="senderEmail">Sender Email</Label>
                      <Input
                        id="senderEmail"
                        type="email"
                        value={emailSettings.senderEmail}
                        onChange={(e) =>
                          setEmailSettings({
                            ...emailSettings,
                            senderEmail: e.target.value,
                          })
                        }
                        className="mt-2"
                        placeholder="noreply@vsvunite.com"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email address that will appear as sender
                      </p>
                    </div>
                  </div>

                  {/* Test Email Section */}
                  <div className="mt-8 p-6 bg-muted/30 rounded-lg border border-border">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      Test Email Configuration
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Send a test email to verify your SMTP settings are working correctly
                    </p>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Input
                          type="email"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          placeholder="Enter test email address"
                          disabled={testingEmail}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={async () => {
                          if (!testEmail || !testEmail.includes("@")) {
                            toast.error("Invalid email", {
                              description: "Please enter a valid email address",
                            });
                            return;
                          }

                          setTestingEmail(true);
                          try {
                            const response = await testEmailConfiguration({
                              testEmail,
                              message: "This is a test email from VSV Unite admin panel.",
                            });

                            if (response.success) {
                              toast.success("Test email sent!", {
                                description: `Email sent successfully to ${testEmail}`,
                              });
                            } else {
                              toast.error("Test failed", {
                                description: response.message || "Failed to send test email",
                              });
                            }
                          } catch (error: any) {
                            toast.error("Test failed", {
                              description: error.response?.data?.message || "Failed to send test email",
                            });
                          } finally {
                            setTestingEmail(false);
                          }
                        }}
                        disabled={testingEmail || !testEmail}
                        className="bg-primary-400 hover:bg-primary-500"
                      >
                        {testingEmail ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Test
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Gmail Instructions */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Gmail Setup Instructions</h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Enable 2-Step Verification in your Google Account</li>
                      <li>Go to Google Account → Security → App Passwords</li>
                      <li>Generate a new App Password for "Mail"</li>
                      <li>Use the 16-character App Password in the SMTP Password field</li>
                      <li>Use your full Gmail address as SMTP Username</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ranks Tab */}
          {activeTab === "ranks" && <RanksTab />}
        </div>
      </div>
    </PageContainer>
  );
}

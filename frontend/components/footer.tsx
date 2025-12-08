import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { text: "Features", href: "#features" },
        { text: "How It Works", href: "#how-it-works" },
        { text: "Pricing Plans", href: "#plans" },
        { text: "Testimonials", href: "#testimonials" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "About Us", href: "#about" },
        { text: "Contact", href: "#contact" },
        { text: "Careers", href: "#careers" },
        { text: "Blog", href: "#blog" },
      ],
    },
    {
      title: "Support",
      links: [
        { text: "Help Center", href: "#help" },
        { text: "FAQs", href: "#faq" },
        { text: "Training", href: "#training" },
        { text: "Community", href: "#community" },
      ],
    },
    {
      title: "Legal",
      links: [
        { text: "Privacy Policy", href: "#privacy" },
        { text: "Terms of Service", href: "#terms" },
        { text: "Refund Policy", href: "#refund" },
        { text: "Compliance", href: "#compliance" },
      ],
    },
  ];

  return (
    <footer className="bg-base-50 border-t border-border">
      <div className="container mx-auto px-6 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image 
                src="/assets/images/logo/vsv-unite.png" 
                alt="VSV Unite Logo" 
                width={56} 
                height={56}
                className="w-14 h-14 object-contain"
              />
              <span className="text-2xl font-bold text-foreground">VSV Unite</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Building transparent and automated network income opportunities for thousands of successful members worldwide.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary-500" />
                <a href="mailto:support@vsvunite.com" className="hover:text-primary-600 transition-colors">
                  support@vsvunite.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary-500" />
                <a href="tel:+911234567890" className="hover:text-primary-600 transition-colors">
                  +91 123 456 7890
                </a>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary-500 mt-0.5" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-primary-600 transition-colors text-sm"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} VSV Unite. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 hover:bg-primary-400 hover:text-primary-foreground transition-all"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 hover:bg-primary-400 hover:text-primary-foreground transition-all"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 hover:bg-primary-400 hover:text-primary-foreground transition-all"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 hover:bg-primary-400 hover:text-primary-foreground transition-all"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Plans", href: "/plans" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center p-1.5">
              <Image 
                src="/assets/images/logo/vsv-unite.png" 
                alt="VSV Unite Logo" 
                width={64} 
                height={64}
                className="w-full h-full object-contain transition-transform group-hover:scale-105"
              />
            </div>
            <span className="text-2xl font-bold text-gray-800">VSV Unite</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary-600 after:transition-all hover:after:w-full"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-primary-600 hover:bg-primary-50" asChild>
                  <Link href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}>
                    <User className="w-4 h-4 mr-2" />
                    {user.name}
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => logout()}
                  className="text-gray-700 hover:text-red-600 hover:border-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-primary-600 hover:bg-primary-50" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-md hover:shadow-lg transition-all" asChild>
                  <Link href="/register">Join Now</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-3">
                    <Image 
                      src="/assets/images/logo/vsv-unite.png" 
                      alt="VSV Unite Logo" 
                      width={64} 
                      height={64}
                      className="w-16 h-16 object-contain"
                    />
                    <span className="text-2xl font-bold">VSV Unite</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-lg font-medium text-foreground hover:text-primary-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="flex flex-col gap-3 pt-6 border-t">
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Logged in as</p>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}>
                          <User className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full text-red-600 hover:bg-red-50" 
                        onClick={() => logout()}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button className="w-full bg-primary-400 hover:bg-primary-500" asChild>
                        <Link href="/register">Join Now</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Heart, User, Menu, X, Search, Sparkles } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="bg-brand-primary text-white text-xs font-medium py-2 px-4 text-center tracking-wide overflow-hidden">
      <div className="flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        <span>Festive Couture Live • Women, Teens & Girls • Free Express Delivery Above ₹999 • 100% Cotton Linings</span>
      </div>
    </div>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Sync cart count from local storage or server
  useEffect(() => {
    try {
      const guestCart = JSON.parse(localStorage.getItem("varnam_guest_cart") || "[]");
      setCartCount(guestCart.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0));
    } catch {
      setCartCount(0);
    }

    const handleCartUpdate = () => {
      try {
        const guestCart = JSON.parse(localStorage.getItem("varnam_guest_cart") || "[]");
        setCartCount(guestCart.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0));
      } catch {
        setCartCount(0);
      }
    };

    window.addEventListener("varnam_cart_updated", handleCartUpdate);
    return () => window.removeEventListener("varnam_cart_updated", handleCartUpdate);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border transition-all">
      <AnnouncementBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-text-heading hover:bg-canvas focus:outline-none focus:ring-2 focus:ring-brand-primary"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo / Brand Wordmark */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <Link href="/" className="inline-block group">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-brand-primary group-hover:text-brand-primary-hover transition-colors">
                Varnam
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-sans uppercase tracking-widest text-brand-secondary font-semibold border-l border-border pl-2">
                Women • Teens • Girls
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links: Segments + Occasions */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-text-body">
            {/* Primary Segment Navigation */}
            <div className="flex items-center space-x-1 bg-surface-raised p-1 rounded-xl border border-border">
              <Link
                href="/collections?segment=women"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-text-heading hover:bg-surface hover:text-brand-primary transition-colors"
              >
                Women
              </Link>
              <Link
                href="/collections?segment=teens"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-text-heading hover:bg-surface hover:text-brand-primary transition-colors"
              >
                Teens (12–18Y)
              </Link>
              <Link
                href="/collections?segment=girls"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-text-heading hover:bg-surface hover:text-brand-primary transition-colors"
              >
                Girls (2–14Y)
              </Link>
            </div>

            <div className="h-4 w-px bg-border" />

            {/* Shared Occasion Categories */}
            <Link href="/collections" className="hover:text-brand-primary transition-colors text-xs font-semibold">
              All Designs
            </Link>
            <Link href="/collections/festive-wedding" className="hover:text-brand-primary transition-colors text-xs font-semibold">
              Festive & Wedding
            </Link>
            <Link href="/collections/party-gowns" className="hover:text-brand-primary transition-colors text-xs font-semibold">
              Party Gowns
            </Link>
            <Link href="/collections/cotton-dresses" className="hover:text-brand-primary transition-colors text-xs font-semibold">
              Cotton Twirls
            </Link>
            <Link href="/collections/casuals-coords" className="hover:text-brand-primary transition-colors text-xs font-semibold">
              Co-ords
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <Link
              href="/collections"
              className="p-2 text-text-heading hover:text-brand-primary hover:bg-canvas rounded-full transition-colors"
              aria-label="Search collection"
            >
              <Search className="w-5 h-5" />
            </Link>

            <Link
              href="/account"
              className="p-2 text-text-heading hover:text-brand-primary hover:bg-canvas rounded-full transition-colors"
              aria-label="My Account"
            >
              <User className="w-5 h-5" />
            </Link>

            <Link
              href="/account?tab=wishlist"
              className="p-2 text-text-heading hover:text-brand-primary hover:bg-canvas rounded-full transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            <Link
              href="/cart"
              className="p-2 text-brand-primary bg-brand-primary-subtle hover:bg-brand-primary hover:text-white rounded-full transition-colors relative"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface animate-in zoom-in-50">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface border-b border-border px-4 pt-2 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Segment Selector in Mobile */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-2 pb-2">
              Shop by Audience
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/collections?segment=women"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center rounded-lg bg-surface-raised border border-border text-xs font-bold text-text-heading hover:bg-brand-primary hover:text-white transition-colors"
              >
                Women
              </Link>
              <Link
                href="/collections?segment=teens"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center rounded-lg bg-surface-raised border border-border text-xs font-bold text-text-heading hover:bg-brand-primary hover:text-white transition-colors"
              >
                Teens (12–18Y)
              </Link>
              <Link
                href="/collections?segment=girls"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center rounded-lg bg-surface-raised border border-border text-xs font-bold text-text-heading hover:bg-brand-primary hover:text-white transition-colors"
              >
                Girls (2–14Y)
              </Link>
            </div>
          </div>

          <div className="border-t border-border pt-2 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-2 py-1">
              Shared Occasions
            </div>
            <Link
              href="/collections"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-text-heading hover:bg-canvas hover:text-brand-primary"
            >
              All Dresses & Apparel
            </Link>
            <Link
              href="/collections/festive-wedding"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-text-heading hover:bg-canvas hover:text-brand-primary"
            >
              Festive & Wedding Heritage
            </Link>
            <Link
              href="/collections/party-gowns"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-text-heading hover:bg-canvas hover:text-brand-primary"
            >
              Party Gowns & Tulle
            </Link>
            <Link
              href="/collections/cotton-dresses"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-text-heading hover:bg-canvas hover:text-brand-primary"
            >
              Cotton Twirl Frocks & Midis
            </Link>
            <Link
              href="/collections/casuals-coords"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-text-heading hover:bg-canvas hover:text-brand-primary"
            >
              Casuals & Co-ords
            </Link>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-around">
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold text-text-body hover:text-brand-primary flex items-center gap-1.5"
            >
              <User className="w-4 h-4" /> Account & Orders
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold text-brand-secondary hover:underline"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Heart, User, Menu, X, ChevronDown, Sparkles } from "lucide-react";
import type { NavigationNode } from "@/lib/db/actions";

interface HeaderProps {
  initialNavTree?: NavigationNode[];
  announcementText?: string;
}

export function MarigoldToranGarland() {
  return (
    <div className="w-full overflow-hidden leading-none select-none h-3.5 bg-[#3B281E]" aria-hidden="true">
      <svg
        className="w-full h-3.5"
        viewBox="0 0 1200 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="repeat-x"
      >
        <defs>
          <pattern id="marigold-toran" width="60" height="14" patternUnits="userSpaceOnUse">
            {/* Top Swag String in Gold */}
            <path d="M 0 0 Q 30 7 60 0" stroke="#C69214" strokeWidth="1.2" fill="none" />
            {/* Mango Leaves */}
            <path d="M 12 3 C 14 7, 16 9, 15 12 C 13 9, 11 7, 12 3 Z" fill="#145349" />
            <path d="M 48 3 C 46 7, 44 9, 45 12 C 47 9, 49 7, 48 3 Z" fill="#145349" />
            {/* Fluffy Marigold Bloom in Center */}
            <circle cx="30" cy="7" r="4.5" fill="#D97706" />
            <circle cx="30" cy="7" r="3" fill="#F59E0B" />
            <circle cx="30" cy="7" r="1.5" fill="#FEF3C7" />
            {/* Small Hanging Golden Bead */}
            <circle cx="30" cy="12.5" r="1" fill="#C69214" />
          </pattern>
        </defs>
        <rect width="100%" height="14" fill="url(#marigold-toran)" />
      </svg>
    </div>
  );
}

export function AnnouncementRibbon({ message }: { message?: string }) {
  const displayMsg =
    message ||
    "🙏 Namaste & Subhamasthu • Handcrafted Indian Couture • 1-Inch Growth Seam Allowance • Free India Shipping > ₹999";

  return (
    <aside aria-label="Announcement" className="bg-[#2A1C15] text-[#FAF5EB] text-[11px] font-medium py-1.5 px-4 text-center tracking-wider border-b border-[#4D3528]/40">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3 text-[#C69214] animate-pulse" />
        <span className="truncate">{displayMsg}</span>
        <Sparkles className="w-3 h-3 text-[#C69214] animate-pulse" />
      </div>
    </aside>
  );
}

export function Header({ initialNavTree, announcementText }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [navTree, setNavTree] = useState<NavigationNode[]>(initialNavTree || []);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);

  // Sync cart count
  useEffect(() => {
    const updateCount = () => {
      try {
        const guestCart = JSON.parse(localStorage.getItem("varnam_guest_cart") || "[]");
        setCartCount(
          guestCart.reduce((acc: number, item: { quantity?: number }) => acc + (item.quantity || 1), 0)
        );
      } catch {
        setCartCount(0);
      }
    };

    updateCount();
    window.addEventListener("varnam_cart_updated", updateCount);
    return () => window.removeEventListener("varnam_cart_updated", updateCount);
  }, []);

  // Fetch navigation tree client-side if not pre-populated
  useEffect(() => {
    if (navTree.length === 0) {
      import("@/lib/db/actions").then(({ getNavigationTree }) => {
        getNavigationTree().then((tree) => setNavTree(tree));
      });
    }
  }, [navTree.length]);

  return (
    <header className="sticky top-0 z-50 bg-[#3B281E] text-[#FAF5EB] shadow-md transition-colors">
      <AnnouncementRibbon message={announcementText} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Mobile menu trigger button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#FAF5EB] hover:bg-[#4D3528] focus:outline-none focus:ring-2 focus:ring-[#C69214]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo / Brand Wordmark: Crisp Editorial Serif (NO cursive/script calligraphy) */}
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-baseline gap-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-[#FAF5EB] group-hover:text-[#C69214] transition-colors">
                VARNAM
              </span>
              <span className="hidden sm:inline-block text-[9px] uppercase tracking-[0.25em] text-[#C69214] font-semibold border-l border-[#C69214]/40 pl-2">
                Indian Couture
              </span>
            </Link>
          </div>

          {/* Desktop Center Navigation: Admin-Controlled Dynamic Subheadings & Dropdowns */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-sm font-medium">
            <Link
              href="/collections"
              className="px-3 py-2 rounded-md text-xs uppercase tracking-wider font-semibold text-[#FAF5EB]/90 hover:text-[#C69214] hover:bg-[#4D3528]/50 transition-colors"
            >
              All Dresses
            </Link>

            {/* Dynamic Admin Subheadings */}
            {navTree.map((node) => {
              const hasChildren = node.children && node.children.length > 0;
              const isOpen = activeDropdown === node.id;

              return (
                <div
                  key={node.id}
                  className="relative group"
                  onMouseEnter={() => hasChildren && setActiveDropdown(node.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <div className="flex items-center">
                    <Link
                      href={`/collections/${node.slug}`}
                      className="px-3 py-2 rounded-md text-xs uppercase tracking-wider font-semibold text-[#FAF5EB]/90 hover:text-[#C69214] hover:bg-[#4D3528]/50 transition-colors flex items-center gap-1"
                    >
                      {node.name}
                      {hasChildren && (
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#C69214]" : ""}`} />
                      )}
                    </Link>
                  </div>

                  {/* Dropdown Menu for Child Clothing Types */}
                  {hasChildren && isOpen && (
                    <div className="absolute top-full left-0 w-64 pt-1 z-50">
                      <div className="bg-[#FAF5EB] text-[#261C17] rounded-xl shadow-2xl border border-[#D8C7AE] p-2 overflow-hidden ring-1 ring-black/5 animate-in fade-in duration-150">
                        <div className="px-3 py-2 border-b border-[#D8C7AE]/60 mb-1">
                          <p className="text-[10px] uppercase font-bold tracking-widest text-[#8B1E3F]">
                            {node.name}
                          </p>
                          {node.description && (
                            <p className="text-[11px] text-[#6B574B] line-clamp-1 mt-0.5">{node.description}</p>
                          )}
                        </div>

                        <div className="py-1">
                          {node.children.map((child) => (
                            <Link
                              key={child.id}
                              href={`/collections/${child.slug}`}
                              onClick={() => setActiveDropdown(null)}
                              className="group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#261C17] hover:bg-[#EFE6D5] hover:text-[#8B1E3F] transition-colors"
                            >
                              <span>{child.name}</span>
                              <span className="text-[10px] text-[#C69214] opacity-0 group-hover:opacity-100 transition-opacity">
                                →
                              </span>
                            </Link>
                          ))}
                        </div>

                        <div className="pt-2 mt-1 border-t border-[#D8C7AE]/60">
                          <Link
                            href={`/collections/${node.slug}`}
                            onClick={() => setActiveDropdown(null)}
                            className="block text-center text-[11px] font-bold text-[#8B1E3F] hover:text-[#721531] py-1"
                          >
                            View Entire {node.name} Collection &rarr;
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quick Segment Filter Pill Bar */}
            <div className="flex items-center space-x-1 ml-2 pl-2 border-l border-[#FAF5EB]/20">
              <Link
                href="/collections?segment=women"
                className="px-2 py-1 rounded text-[11px] font-medium text-[#FAF5EB]/80 hover:text-[#FAF5EB] hover:bg-[#4D3528]/40 transition-colors"
              >
                Women
              </Link>
              <Link
                href="/collections?segment=teens"
                className="px-2 py-1 rounded text-[11px] font-medium text-[#FAF5EB]/80 hover:text-[#FAF5EB] hover:bg-[#4D3528]/40 transition-colors"
              >
                Teens
              </Link>
              <Link
                href="/collections?segment=girls"
                className="px-2 py-1 rounded text-[11px] font-medium text-[#FAF5EB]/80 hover:text-[#FAF5EB] hover:bg-[#4D3528]/40 transition-colors"
              >
                Girls
              </Link>
            </div>
          </nav>

          {/* Right Action Icons: Search, Wishlist, Account, Cart */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link
              href="/account/wishlist"
              className="p-2 rounded-full text-[#FAF5EB]/90 hover:text-[#C69214] hover:bg-[#4D3528] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            <Link
              href="/account"
              className="p-2 rounded-full text-[#FAF5EB]/90 hover:text-[#C69214] hover:bg-[#4D3528] transition-colors"
              aria-label="My Account"
            >
              <User className="w-5 h-5" />
            </Link>

            <Link
              href="/cart"
              className="relative p-2 rounded-full bg-[#8B1E3F] text-[#FAF5EB] hover:bg-[#721531] transition-colors shadow-sm flex items-center justify-center"
              aria-label={`Shopping bag with ${cartCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C69214] text-[#261C17] text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#3B281E]">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Marigold Toran Garland on bottom edge */}
      <MarigoldToranGarland />

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF5EB] text-[#261C17] border-b border-[#D8C7AE] shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8C7AE]">
              <span className="font-serif text-lg font-bold text-[#8B1E3F]">Storefront Navigation</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-[#6B574B] hover:text-[#261C17]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <Link
                href="/collections"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-bold text-[#261C17] hover:bg-[#EFE6D5]"
              >
                All Couture &amp; Dresses
              </Link>

              {/* Dynamic Subheadings in Mobile Menu */}
              {navTree.map((node) => {
                const hasChildren = node.children && node.children.length > 0;
                const isExpanded = expandedMobileCategory === node.id;

                return (
                  <div key={node.id} className="border-b border-[#D8C7AE]/40 last:border-0 pb-1">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/collections/${node.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 px-3 py-2 text-sm font-bold text-[#8B1E3F] hover:text-[#721531]"
                      >
                        {node.name}
                      </Link>
                      {hasChildren && (
                        <button
                          type="button"
                          onClick={() => setExpandedMobileCategory(isExpanded ? null : node.id)}
                          className="p-2 text-[#6B574B]"
                          aria-label={`Toggle ${node.name} items`}
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>

                    {hasChildren && isExpanded && (
                      <div className="pl-4 pr-2 pb-2 space-y-1">
                        {node.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/collections/${child.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-1.5 rounded text-xs font-semibold text-[#261C17] hover:bg-[#EFE6D5]"
                          >
                            • {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Demographic Direct Shortcuts */}
            <div className="pt-2 border-t border-[#D8C7AE] grid grid-cols-3 gap-2">
              <Link
                href="/collections?segment=women"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center text-xs font-bold rounded-lg bg-[#EFE6D5] text-[#261C17]"
              >
                Women
              </Link>
              <Link
                href="/collections?segment=teens"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center text-xs font-bold rounded-lg bg-[#EFE6D5] text-[#261C17]"
              >
                Teens
              </Link>
              <Link
                href="/collections?segment=girls"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center text-xs font-bold rounded-lg bg-[#EFE6D5] text-[#261C17]"
              >
                Girls
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/db/client";
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import { getSafeRedirectUrl } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIsAdmin =
    searchParams.get("role") === "admin" ||
    searchParams.get("redirectTo")?.startsWith("/admin") ||
    false;

  const [loginRole, setLoginRole] = useState<"customer" | "admin">(
    initialIsAdmin ? "admin" : "customer"
  );
  const redirectTo = getSafeRedirectUrl(
    searchParams.get("redirectTo"),
    loginRole === "admin" ? "/admin" : "/account"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        // Check if user is an admin
        let isAdmin = false;
        if (authData?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .single();
          if (profile?.role === "admin" || authData.user.email?.toLowerCase() === "mahalakshmipulluru@gmail.com") {
            isAdmin = true;
          }
        }

        if (loginRole === "admin" && !isAdmin) {
          setError("Access restricted: This account does not have merchant administrator privileges.");
          return;
        }

        // Sync local guest cart into authenticated DB cart
        try {
          const guestCart = JSON.parse(
            localStorage.getItem("varnam_guest_cart") || "[]"
          );
          if (guestCart.length > 0) {
            const formatted = guestCart.map((i: { variant_id: string; quantity: number }) => ({
              variant_id: i.variant_id,
              quantity: i.quantity,
            }));
            await supabase.rpc("merge_guest_cart", { p_items: formatted });
            localStorage.removeItem("varnam_guest_cart");
          }
        } catch (mergeErr) {
          console.error("Guest cart merge error:", mergeErr);
        }

        const rawRedirect = searchParams.get("redirectTo");
        if ((loginRole === "admin" || isAdmin) && (!rawRedirect || rawRedirect === "/account")) {
          router.push("/admin");
        } else {
          router.push(redirectTo);
        }
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to sign in");
      }
    });
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-8 bg-[#FAF5EB] rounded-2xl border border-[#D8C7AE] shadow-[0_8px_24px_-6px_rgba(59,40,30,0.12)] space-y-6">
      {/* Role Toggle Tabs: Customer vs Admin */}
      <div className="grid grid-cols-2 p-1 bg-[#EFE6D5] rounded-xl border border-[#D8C7AE]">
        <button
          type="button"
          onClick={() => {
            setLoginRole("customer");
            setError(null);
          }}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            loginRole === "customer"
              ? "bg-[#FAF5EB] text-[#8B1E3F] shadow-xs"
              : "text-[#6B574B] hover:text-[#261C17]"
          }`}
        >
          Customer Login
        </button>
        <button
          type="button"
          onClick={() => {
            setLoginRole("admin");
            setError(null);
          }}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            loginRole === "admin"
              ? "bg-[#3B281E] text-[#FAF5EB] shadow-xs"
              : "text-[#6B574B] hover:text-[#261C17]"
          }`}
        >
          Admin Portal
        </button>
      </div>

      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE6D5] text-[#8B1E3F] text-[11px] font-bold border border-[#C69214]/50">
          <Sparkles className="w-3.5 h-3.5 text-[#C69214]" />
          <span>{loginRole === "admin" ? "Merchant Administration" : "Varnam Customer Atelier"}</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#261C17] mt-2">
          {loginRole === "admin" ? "Admin & Staff Login" : "Welcome Back"}
        </h1>
        <p className="text-xs text-[#6B574B]">
          {loginRole === "admin"
            ? "Sign in with staff credentials to manage banners, categories, and catalog operations."
            : "Sign in to access your saved heirloom sizes, order history, and wishlist."}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-[#261C17] mb-1">
            {loginRole === "admin" ? "Admin Work Email" : "Email Address"}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#6B574B] absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={loginRole === "admin" ? "admin@varnam.com" : "ananya@example.com"}
              className="w-full pl-9 pr-3 py-2.5 bg-[#EFE6D5]/50 border border-[#D8C7AE] rounded-xl text-[#261C17] focus:ring-2 focus:ring-[#8B1E3F] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-[#261C17]">Password</label>
            <span className="text-[11px] text-[#8B1E3F] hover:underline cursor-pointer">
              Forgot password?
            </span>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#6B574B] absolute left-3 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 bg-[#EFE6D5]/50 border border-[#D8C7AE] rounded-xl text-[#261C17] focus:ring-2 focus:ring-[#8B1E3F] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={`w-full py-3 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 ${
            loginRole === "admin"
              ? "bg-[#3B281E] text-[#FAF5EB] hover:bg-[#2A1C15]"
              : "bg-[#8B1E3F] text-[#FAF5EB] hover:bg-[#721531]"
          }`}
        >
          {isPending
            ? "Signing In..."
            : loginRole === "admin"
            ? "Sign In to Admin Dashboard"
            : "Sign In as Customer"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-4 border-t border-[#D8C7AE]/60 text-center text-xs text-[#6B574B]">
        {loginRole === "admin" ? (
          <p>
            Looking for customer shopping?{" "}
            <button
              type="button"
              onClick={() => setLoginRole("customer")}
              className="font-bold text-[#8B1E3F] hover:underline"
            >
              Switch to Customer Login
            </button>
          </p>
        ) : (
          <p>
            Don&apos;t have a Varnam account?{" "}
            <Link
              href={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
              className="font-bold text-[#8B1E3F] hover:underline"
            >
              Create one now
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-text-muted">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

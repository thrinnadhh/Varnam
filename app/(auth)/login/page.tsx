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
  const redirectTo = getSafeRedirectUrl(searchParams.get("redirectTo"), "/account");

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
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
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

        router.push(redirectTo);
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to sign in");
      }
    });
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-8 bg-surface rounded-2xl border border-border shadow-warm-md space-y-6">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary-subtle text-brand-primary text-[11px] font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Varnam Customer Atelier</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-heading mt-2">
          Welcome Back
        </h1>
        <p className="text-xs text-text-muted">
          Sign in to access your saved heirloom sizes, order history, and wishlist.
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
          <label className="block font-semibold text-text-heading mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ananya@example.com"
              className="w-full pl-9 pr-3 py-2.5 bg-canvas border border-border rounded-xl text-text-heading focus:ring-1 focus:ring-brand-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-text-heading">Password</label>
            <span className="text-[11px] text-brand-primary hover:underline cursor-pointer">
              Forgot password?
            </span>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-text-muted absolute left-3 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 bg-canvas border border-border rounded-xl text-text-heading focus:ring-1 focus:ring-brand-primary focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primary-hover shadow-warm-sm transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
        >
          {isPending ? "Signing In..." : "Sign In & Continue"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-4 border-t border-border-subtle text-center text-xs text-text-muted">
        <span>Don&apos;t have a Varnam account? </span>
        <Link
          href={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="font-bold text-brand-primary hover:underline"
        >
          Create one now
        </Link>
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

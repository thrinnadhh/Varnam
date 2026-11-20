"use client";

import { useEffect } from "react";
import Link from "next/link";
import { captureException } from "@/lib/monitoring";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report unhandled root error
    captureException(error, {
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-canvas text-stone-900 font-sans min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface border border-stone-200 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-warm-md">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 text-2xl font-serif">
            !
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-bold text-stone-900">
              Something went wrong
            </h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              We encountered an unexpected error while preparing your couture experience. Our team has been notified.
            </p>
            {error.digest && (
              <p className="text-[10px] font-mono text-stone-400">
                Ref: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary/90 transition-all shadow-warm-sm"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 bg-white text-stone-800 text-xs font-semibold hover:bg-stone-50 transition-all text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

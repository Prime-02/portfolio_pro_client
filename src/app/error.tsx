"use client";

import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [mounted, setMounted] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  const handleReset = () => {
    setIsRetrying(true);
    // Small delay to show the retrying state
    setTimeout(() => {
      setIsRetrying(false);
      reset();
    }, 400);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >

      <div
        className={`relative z-10 text-center max-w-lg transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
      >
        {/* Error Icon - Fixed */}
        <div
          className="mx-auto mb-6 flex items-center justify-center w-20 h-20 rounded-2xl relative overflow-hidden"
        >
          {/* Background layer with low opacity */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              backgroundColor: "var(--foreground)",
              opacity: 0.08,
            }}
          />

          {/* Icon - full visibility */}
          <AlertCircle
            size={36}
            strokeWidth={1.5}
            className="relative z-10"
            style={{
              color: "var(--foreground)",
            }}
          />
        </div>

        {/* Error Code / Status */}
        <h1
          className="font-league text-5xl md:text-6xl mb-2"
          style={{
            fontFamily: "var(--font-league)",
            fontWeight: 800,
            color: "var(--foreground)",
          }}
        >
          Oops!
        </h1>

        {/* Divider line */}
        <div
          className="w-16 h-[2px] mx-auto my-5 rounded-full"
          style={{
            background: "var(--accent)",
            opacity: 0.6,
          }}
        />

        {/* Heading */}
        <h2
          className="font-league text-2xl md:text-3xl mb-4"
          style={{
            fontFamily: "var(--font-league)",
            fontWeight: 700,
            color: "var(--foreground)",
          }}
        >
          Something Went Wrong
        </h2>

        {/* Description */}
        <p
          className="text-base md:text-lg mb-4 leading-relaxed"
          style={{
            color: "var(--foreground)",
            opacity: 0.6,
            maxWidth: "420px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          We encountered an unexpected error while loading this page. Please try
          again or contact support if the problem persists.
        </p>

        {/* Error digest (Next.js error ID) - Fixed */}
        {error.digest && (
          <div
            className="inline-block mb-8 px-4 py-2 rounded-md text-xs font-mono relative overflow-hidden"
          >
            {/* Background layer with low opacity */}
            <div
              className="absolute inset-0 rounded-md"
              style={{
                backgroundColor: "var(--foreground)",
                opacity: 0.1,
              }}
            />

            {/* Text - full visibility */}
            <span
              className="relative z-10"
              style={{
                color: "var(--foreground)",
              }}
            >
              Error ID: {error.digest}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Retry Button */}
          <button
            onClick={handleReset}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-league text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              fontFamily: "var(--font-league)",
              fontWeight: 600,
              background: "var(--foreground)",
              color: "var(--background)",
              boxShadow: "0 4px 20px -4px var(--foreground)",
            }}
          >
            {isRetrying ? (
              <>
                <RefreshCw
                  size={18}
                  strokeWidth={2}
                  className="animate-spin"
                />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw size={18} strokeWidth={2} />
                Try Again
              </>
            )}
          </button>

          {/* Go Home Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-league text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              fontFamily: "var(--font-league)",
              fontWeight: 600,
              background: "transparent",
              color: "var(--foreground)",
              border: "1.5px solid var(--foreground)",
              opacity: 0.7,
            }}
          >
            <Home size={18} strokeWidth={2} />
            Go Home
          </Link>
        </div>
      </div>

      {/* Bottom decorative text */}
      <p
        className="absolute bottom-8 text-xs tracking-widest uppercase font-league"
        style={{
          fontFamily: "var(--font-league)",
          fontWeight: 500,
          color: "var(--foreground)",
          opacity: 0.15,
        }}
      >
        Application Error
      </p>
    </div>
  );
}
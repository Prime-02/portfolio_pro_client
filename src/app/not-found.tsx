"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Home } from "lucide-react";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        {/* 404 Number - Improved gradient text */}
        <h1
          className="font-league text-[8rem] leading-none tracking-tighter select-none relative"
          style={{
            fontFamily: "var(--font-league)",
            fontWeight: 900,
          }}
        >
          <span
            style={{
              background: "linear-gradient(135deg, var(--foreground) 0%, var(--accent) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent", // Fallback for browsers that don't support background-clip: text
            }}
          >
            404
          </span>
        </h1>

        {/* Divider line */}
        <div
          className="w-16 h-[2px] mx-auto my-6 rounded-full"
          style={{
            background: "var(--accent)",
            opacity: 0.6,
          }}
        />

        {/* Heading */}
        <h2
          className="font-league text-3xl md:text-4xl mb-4"
          style={{
            fontFamily: "var(--font-league)",
            fontWeight: 700,
            color: "var(--foreground)",
          }}
        >
          Page Not Found
        </h2>

        {/* Description */}
        <p
          className="text-base md:text-lg mb-10 leading-relaxed"
          style={{
            color: "var(--foreground)",
            opacity: 0.6,
            maxWidth: "420px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        {/* CTA Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-league text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            fontFamily: "var(--font-league)",
            fontWeight: 600,
            background: "var(--foreground)",
            color: "var(--background)",
            boxShadow: "0 4px 20px -4px var(--foreground)",
          }}
        >
          <Home size={18} strokeWidth={2} />
          Back to Home
        </Link>
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
        Error 404 &mdash; Not Found
      </p>
    </div>
  );
}
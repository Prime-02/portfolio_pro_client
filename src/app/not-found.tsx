"use client";
import React, { useState, useEffect, Suspense } from "react";
import { Home, Search, ArrowLeft, Zap, Globe, Star } from "lucide-react";

const NotFoundPage: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const floatingElements = Array.from({ length: 6 }, (_, i) => (
    <div
      key={i}
      className={`absolute opacity-20 animate-pulse`}
      style={{
        left: `${20 + i * 15}%`,
        top: `${30 + i * 8}%`,
        animationDelay: `${i * 0.5}s`,
        animationDuration: `${3 + i * 0.5}s`,
      }}
    >
      {i % 3 === 0 ? (
        <Zap className="w-6 h-6 text-[var(--accent)]" />
      ) : i % 3 === 1 ? (
        <Globe className="w-5 h-5 text-[var(--accent)]" />
      ) : (
        <Star className="w-4 h-4 text-yellow-400" />
      )}
    </div>
  ));

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[var(--accent)] to-slate-900 relative overflow-hidden">
        {/* Animated background gradient */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.15), transparent 40%)`,
          }}
        />

        {/* Floating elements */}
        {floatingElements}

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="text-center max-w-2xl mx-auto">
            {/* 404 Number with glassmorphism effect */}
            {/* 404 Number with glassmorphism effect */}
            <div className="relative mb-8 flex flex-col items-center justify-center">
              {/* Glassmorphism 404 number */}
              <div className="relative z-10 mb-8 flex items-center justify-center">
                {["4", "0", "4"].map((digit, index) => (
                  <div
                    key={index}
                    className="mx-2 flex h-32 w-32 items-center justify-center rounded-full text-7xl font-bold backdrop-blur-lg"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    {digit}
                  </div>
                ))}
              </div>

              {/* Optional decorative elements */}
              <div className="absolute inset-0 overflow-hidden opacity-10">
                <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-[var(--accent)] mix-blend-overlay blur-xl"></div>
                <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[var(--accent)] mix-blend-overlay blur-xl"></div>
              </div>
            </div>

            {/* Glass card container */}
            <div className="backdrop-blur-xl bg/5 rounded-3xl border border-white p-8 md:p-12 shadow-2xl">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h1 className="text-3xl text-white md:text-4xl font-bold text">
                    Page Not Found
                  </h1>
                  <p className="text-lg text-white leading-relaxed">
                    {` Oops! The page you're looking for seems to have vanished into
                  the digital void. Don't worry, even the best explorers
                  sometimes take a wrong turn.`}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <button
                    onClick={() => window.history.back()}
                    className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[var(--accent)]  text font-semibold rounded-xl hover:from-[var(--accent)]  transform hover:scale-105 text-white transition-all duration-300 shadow-lg hover:shadow-[var(--accent)]/25"
                  >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                    Go Back
                  </button>

                  <button
                    onClick={() => (window.location.href = "/")}
                    className="group flex items-center gap-3 px-6 py-3 bg/10 text font-semibold rounded-xl border transform hover:scale-105 transition-all duration-300 backdrop-blur-sm text-white"
                  >
                    <Home className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    Home
                  </button>

                  <button
                    onClick={() => {
                      const query = prompt("What are you looking for?");
                      if (query)
                        window.location.href = `/search?q=${encodeURIComponent(query)}`;
                    }}
                    className="group flex items-center gap-3 px-6 py-3 bg/10 text font-semibold rounded-xl border transform hover:scale-105 transition-all duration-300 backdrop-blur-sm text-white"
                  >
                    <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Footer text */}
            <div className="mt-8 text-white text-sm">
              <p>{`Lost? Don't worry, every great journey has a few detours.`}</p>
            </div>
          </div>
        </div>

        {/* Ambient light effect */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-t from-[var(--accent)]/10 to-transparent rounded-full blur-3xl" />
      </div>
    </Suspense>
  );
};

export default NotFoundPage;

"use client";
import { useState } from "react";
import { AlertCircle, Power, RotateCcw, ArrowLeft, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const nav = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[var(--accent)] to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background sparkles */}
      {/* Main error container */}
      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Animated plug icon */}
        <div className="relative mb-8">
          <div
            className={`inline-block p-8 rounded-full bg-gradient-to-br from-red-500 to-pink-600 shadow-2xl transform transition-all duration-700 ${isAnimating ? "scale-110 rotate-12" : "hover:scale-105"}`}
          >
            <Power
              size={80}
              className={`text-white transition-all duration-500 ${isAnimating ? "animate-spin" : ""}`}
            />
          </div>

          {/* Electric spark effect */}
          <div className="absolute -top-2 -right-2">
            <Zap className="text-yellow-400 animate-bounce" size={32} />
          </div>
        </div>

        {/* Error message */}
        <div className="space-y-4 mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text ">
            Oops!
          </h1>
          <h2 className="text-2xl font-semibold text-gray-200 mb-2">
            Looks like you pulled a plug
          </h2>
          <p className="text-lg text-white max-w-md mx-auto leading-relaxed">
            Don't worry, these things happen. The connection got a bit tangled,
            but we can get everything back up and running.
          </p>
        </div>

        {/* Error details card */}
        <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/10">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <AlertCircle className="text-white" size={20} />
            <span className="text-white font-medium">Error Details</span>
          </div>
          <p className="text-white text-sm">
            {error?.message || "An unexpected error occurred."}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={reset}
            disabled={isAnimating}
            className={`group bg-gradient-to-r from-blue-600 to-[var(--accent)] hover:from-blue-700 hover:to-[var(--accent)] text-white font-semibold py-4 px-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed flex items-center space-x-2 ${isAnimating ? "animate-pulse" : ""}`}
          >
            <RotateCcw
              className={`transition-transform duration-300 ${isAnimating ? "animate-spin" : "group-hover:rotate-180"}`}
              size={20}
            />
            <span>{isAnimating ? "Reconnecting..." : "Plug Back In"}</span>
          </button>

          <button
            onClick={() => nav.back()}
            className="group bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
          >
            <ArrowLeft
              className="group-hover:scale-110 transition-transform duration-300"
              size={20}
            />
            <span>Go Back</span>
          </button>
        </div>

        {/* Helpful tips */}
        <div className="mt-12 text-center">
          <p className="text-white text-sm">
            If the problem persists, try refreshing the page or checking your
            internet connection
          </p>
        </div>
      </div>
    </div>
  );
}

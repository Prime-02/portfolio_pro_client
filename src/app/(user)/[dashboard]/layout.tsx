"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProfileSideBar from "../components/ProfileSideBar";
import { useGlobalState } from "@/app/globalStateProvider";
import { useToast } from "@/app/components/toastify/Toastify";
import { Info } from "lucide-react";
import PortfolioProLogo from "@/app/components/logo/PortfolioProTextLogo";

const UsersLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const toast = useToast();
  const [isInitialized, setIsInitialized] = useState(false);

  const { currentUser, getCurrentUser, router, accessToken, setAccessToken } =
    useGlobalState();

  // First, check localStorage and initialize the token
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("session_token");
      if (token) {
        setAccessToken(token);
      }
      setIsInitialized(true); // Mark as initialized regardless of token presence
    }
  }, []); // Removed setAccessToken from dependencies

  // Then, check for authentication after initialization
  useEffect(() => {
    if (!isInitialized) return; // Wait for initialization

    if (!accessToken) {
      toast.toast("Please Login to continue", {
        type: "default",
        icon: <Info className="w-5 h-5 text-[var(--accent)]" />,
        className:
          "border-[var(--accent)] bg-purple-[var(--background)] text-[var(--accent)]",
        sound: true,
        animation: "scale",
        position: "bottom-center",
      });
      router.replace("/user-auth?auth_mode=login");
    }
  }, [accessToken, isInitialized]); // Removed toast and router from dependencies

  // Get current user when token is available (with additional safeguards)
  useEffect(() => {
    if (!accessToken || !isInitialized) return;

    // Only call getCurrentUser if we don't already have user data
    if (!currentUser) {
      getCurrentUser();
    }
  }, [accessToken, isInitialized, currentUser]);

  // Show loading state during initialization
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>
          <PortfolioProLogo
            tracking={0.2}
            scale={0.75}
            fontWeight={"extrabold"}
            reanimateDelay={3000}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Fixed Sidebar - doesn't scroll */}
      <div className="flex-shrink-0">
        <ProfileSideBar />
      </div>
      
      {/* Main Content Area - scrollable */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <motion.div
          className="flex items-start justify-center min-h-full w-full mx-auto py-5 px-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier for smooth easing
          }}
        >
          <motion.div
            className="rounded-3xl h-auto min-h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.1,
              ease: "easeOut",
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default UsersLayout;
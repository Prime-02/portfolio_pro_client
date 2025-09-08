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
    <>
      <div className="flex">
        <ProfileSideBar />
        <motion.div
          className="flex items-start justify-center min-h-screen h-auto w-full mx-auto overflow-auto py-5 px-2"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
        >
          <motion.div
            className={`rounded-3xl min-h-screen h-auto w-full `}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: "easeOut",
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default UsersLayout;

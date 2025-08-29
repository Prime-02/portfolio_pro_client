"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import ProfileSideBar from "../components/ProfileSideBar";
import { useGlobalState } from "@/app/globalStateProvider";
import { useToast } from "@/app/components/toastify/Toastify";
import { Info } from "lucide-react";

const UsersLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const toast = useToast();

  const { currentUser, getCurrentUser, router, accessToken, setAccessToken } =
    useGlobalState();

  useEffect(() => {
    if (!accessToken) return;

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
  }, [accessToken]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("session_token");
      if (token) {
        setAccessToken(token);
      } else {
        toast.info("Kindly login to continue");
        router.replace("/user-auth");
      }
    }
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    getCurrentUser();
  }, [currentUser, accessToken]);

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
            className={`rounded-3xl h-auto max-w-fit border-[var(--accent)]/20 border `} // Changed from w-fit to w-full
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

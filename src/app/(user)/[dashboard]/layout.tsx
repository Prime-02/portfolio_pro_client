"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProfileSideBar from "../components/ProfileSideBar";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import {
  getColorShade,
  getCurrentUrl,
} from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/app/components/toastify/Toastify";
import { Info } from "lucide-react";

const UsersLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { theme } = useTheme();
  const { isLoaded, isSignedIn } = useUser();
  const toast = useToast();
  const {
    currentUser,
    getCurrentUser,
    router,
    accessToken,
    currentPath,
    checkValidId,
  } = useGlobalState();
  const [fullScreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (window !== undefined) {
      const pageUrl = getCurrentUrl("pathSegment", 1);
      const validId = checkValidId(getCurrentUrl("lastPathSegment"));

      if (pageUrl === "media-gallery" && validId) {
        setFullscreen(true);
      } else {
        setFullscreen(false);
      }
    }
  }, [currentPath]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
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
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!accessToken) return;
    getCurrentUser();
  }, [currentUser, accessToken]);

  return (
    <>
      <div className="flex">
        <ProfileSideBar />
        <motion.div
          className="flex items-center justify-center min-h-screen h-auto w-full mx-auto overflow-auto py-5 px-2"
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
            className={`rounded-3xl h-auto ${fullScreen ? "max-w-full w-full" : "max-w-fit"}  `} // Changed from w-fit to w-full
            style={{
              backgroundColor: getColorShade(theme?.background, 10),
            }}
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

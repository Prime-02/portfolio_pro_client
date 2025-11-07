"use client";
import React from "react";
import { motion } from "framer-motion";
import ProfileSideBar from "../components/ProfileSideBar";

const UsersLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Fixed Sidebar - doesn't scroll */}
      {/* <div className="flex-shrink-0">
        <ProfileSideBar />
      </div>
       */}
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
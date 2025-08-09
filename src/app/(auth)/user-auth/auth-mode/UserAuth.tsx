"use client";
import PortfolioProLogo from "@/app/components/logo/PortfolioProLogo";
import React, { useState, useEffect } from "react";
import Login from "./Login";
import SignUp from "./SignUp";
import PasswordRetrieval from "./PasswordRetrieval";
import { motion, AnimatePresence } from "framer-motion";
import OAuth from "./OAuth";
import { useGlobalState } from "@/app/globalStateProvider";

type AuthMode = "signup" | "login" | "password-retrieval";

interface AuthModeOptions {
  mode: AuthMode;
}

const authComponents: Record<AuthMode, React.ComponentType> = {
  signup: SignUp,
  login: Login,
  "password-retrieval": PasswordRetrieval,
};

const UserAuth = () => {
  const { extendRouteWithQuery, searchParams } = useGlobalState();
  const [authMode, setAuthMode] = useState<AuthModeOptions>({ mode: "signup" });
  const [direction, setDirection] = useState(0);

  // Read initial auth mode from URL query parameter
  useEffect(() => {
    const modeFromQuery = searchParams.get("auth_mode");
    if (
      modeFromQuery &&
      ["signup", "login", "password-retrieval"].includes(modeFromQuery)
    ) {
      setAuthMode({ mode: modeFromQuery as AuthMode });
    }
  }, [searchParams]);

  // Animation variants for sliding
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  // Define mode order for navigation
  const modeOrder: AuthMode[] = ["signup", "login", "password-retrieval"];

  const handleModeChange = (newMode: AuthMode) => {
    const currentIndex = modeOrder.indexOf(authMode.mode);
    const newIndex = modeOrder.indexOf(newMode);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setAuthMode({ mode: newMode });
    // Update URL with new auth mode
    extendRouteWithQuery({ auth_mode: newMode });
  };

  // Handle swipe to change modes
  const handleSwipe = (offset: number) => {
    const currentIndex = modeOrder.indexOf(authMode.mode);
    let newIndex = currentIndex;

    // Swipe left (positive offset) -> next mode
    if (offset > 50 && currentIndex < modeOrder.length - 1) {
      newIndex = currentIndex + 1;
    }
    // Swipe right (negative offset) -> previous mode
    else if (offset < -50 && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }

    if (newIndex !== currentIndex) {
      handleModeChange(modeOrder[newIndex]);
    }
  };

  const ActiveComponent = authComponents[authMode.mode];

  return (
    <div className="flex flex-col overflow-auto bg-[var(--background)] py-5 rounded-3xl items-center justify-center gap-y-3">
      <div className="flex items-center justify-center w-auto mx-auto h-auto">
        <PortfolioProLogo scale={0.2} />
      </div>
      <div className="border-[var(--accent)] border rounded-2xl shadow-xl min-w-sm h-auto min-h-32 overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={authMode.mode}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full h-full"
            drag="x" // Enable horizontal drag
            dragConstraints={{ left: 0, right: 0 }} // Prevent dragging beyond bounds
            onDragEnd={(_event, info) => handleSwipe(info.offset.x)} // Handle swipe
            dragElastic={0.2} // Add some elasticity to the drag
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex mx-auth items-center justify-between w-sm">
        <span className="w-[40%] h-[0.25px] bg-[var(--accent)]"></span>
        <span>or</span>
        <span className="w-[40%] h-[0.25px] bg-[var(--accent)]"></span>
      </div>
      <div className="w-sm">
        <OAuth isSignUp={authMode.mode === "signup"} />
      </div>
      <div className="flex flex-col items-center gap-y-2">
        <p className="text-sm">
          {authMode.mode === "signup"
            ? "Already have an account?"
            : "Don't have an account?"}
          <strong
            onClick={() =>
              handleModeChange(authMode.mode === "login" ? "signup" : "login")
            }
            className="text-[var(--accent)] cursor-pointer hover:underline ml-1"
          >
            {authMode.mode === "signup" ? "Sign in" : "Sign Up"}
          </strong>
        </p>
        {authMode.mode !== "password-retrieval" && (
          <p className="text-sm">
            {`Can't remember your credentials?`}
            <strong
              onClick={() => handleModeChange("password-retrieval")}
              className="text-[var(--accent)] cursor-pointer hover:underline ml-1"
            >
              Reset your password
            </strong>
          </p>
        )}
        {authMode.mode === "password-retrieval" && (
          <p className="text-sm">
            Back to
            <strong
              onClick={() => handleModeChange("login")}
              className="text-[var(--accent)] cursor-pointer hover:underline ml-1"
            >
              Login
            </strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default UserAuth;

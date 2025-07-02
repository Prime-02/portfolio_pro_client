"use client";

import React, { createContext, useContext, ReactNode } from "react";

// Define the type for the global state
type GlobalStateContextType = {
  // Define your context properties here
};

// Context initialization
const GlobalStateContext = createContext<GlobalStateContextType | undefined>(
  undefined
);

// Provider component
export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  // Define your state and functions here

  return (
    <GlobalStateContext.Provider
      value={{
        // Provide your context values here
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

// Hook to use global state
export const useGlobalState = (): GlobalStateContextType => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};
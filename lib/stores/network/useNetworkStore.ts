import { create } from "zustand";

interface NetworkStore {
  isOnline: boolean;
  _initListeners: () => () => void;
}

export const useNetworkStore = create<NetworkStore>((set) => ({
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,

  _initListeners: () => {
    if (typeof window === "undefined") return () => {};

    const handleOnline = () => set({ isOnline: true });
    const handleOffline = () => set({ isOnline: false });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  },
}));

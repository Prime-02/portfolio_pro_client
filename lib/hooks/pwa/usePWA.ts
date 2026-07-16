// hooks/usePWA.ts
import { useState, useEffect, useCallback } from "react";

interface PWAInstallState {
  isInstalled: boolean;
  isInstallable: boolean;
  deferredPrompt: any | null;
}

interface UsePWAReturn {
  isInstalled: boolean;
  isInstallable: boolean;
  installApp: () => Promise<boolean>;
  isStandalone: boolean;
}

export const usePWA = (): UsePWAReturn => {
  const [state, setState] = useState<PWAInstallState>({
    isInstalled: false,
    isInstallable: false,
    deferredPrompt: null,
  });

  const [isStandalone, setIsStandalone] = useState(false);

  // Check if app is already installed and if it's installable
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already running in standalone mode (installed PWA)
    const checkInstalled = () => {
      // Standard PWA check
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setState((prev) => ({ ...prev, isInstalled: true }));
        setIsStandalone(true);
        return true;
      }

      // iOS standalone mode check
      if (
        "standalone" in window.navigator &&
        (window.navigator as any).standalone === true
      ) {
        setState((prev) => ({ ...prev, isInstalled: true }));
        setIsStandalone(true);
        return true;
      }

      // Check using getInstalledRelatedApps API
      if ("getInstalledRelatedApps" in navigator) {
        (navigator as any)
          .getInstalledRelatedApps()
          .then((apps: any[]) => {
            if (apps.length > 0) {
              setState((prev) => ({ ...prev, isInstalled: true }));
            }
          })
          .catch(() => {
            // Silently fail if API is not supported properly
          });
      }

      return false;
    };

    // Initial check
    const isAlreadyInstalled = checkInstalled();

    // Listen for display mode changes
    const displayModeMediaQuery = window.matchMedia(
      "(display-mode: standalone)",
    );

    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setState((prev) => ({ ...prev, isInstalled: true }));
        setIsStandalone(true);
      }
    };

    displayModeMediaQuery.addEventListener("change", handleDisplayModeChange);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setState((prev) => ({
        ...prev,
        isInstallable: !isAlreadyInstalled,
        deferredPrompt: e,
      }));
    };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      setState((prev) => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        deferredPrompt: null,
      }));
      console.log("PWA was installed successfully");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      displayModeMediaQuery.removeEventListener(
        "change",
        handleDisplayModeChange,
      );
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Function to trigger the install prompt
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!state.deferredPrompt) {
      console.warn("App is not installable at this moment");
      return false;
    }

    try {
      // Show the install prompt
      state.deferredPrompt.prompt();

      // Wait for user's choice
      const { outcome } = await state.deferredPrompt.userChoice;

      console.log(`User installation response: ${outcome}`);

      // Clear the saved prompt (can only be used once)
      setState((prev) => ({ ...prev, deferredPrompt: null }));

      return outcome === "accepted";
    } catch (error) {
      console.error("Error during installation:", error);
      return false;
    }
  }, [state.deferredPrompt]);

  return {
    isInstalled: state.isInstalled,
    isInstallable: state.isInstallable,
    installApp,
    isStandalone,
  };
};

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useRouting = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State for storing redirect URLs
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedRedirect = localStorage.getItem("redirectUrl");
    if (storedRedirect) {
      setRedirectUrl(storedRedirect);
    }
  }, []);

  // Setter that syncs with localStorage
  const setRedirectUrlWithStorage = useCallback((url: string | null) => {
    setRedirectUrl(url);
    if (url) {
      localStorage.setItem("redirectUrl", url);
    } else {
      localStorage.removeItem("redirectUrl");
    }
  }, []);

  // Navigate to stored redirect URL and clear it
  const navigateToRedirect = useCallback(() => {
    // Read directly from localStorage to avoid stale closure
    const storedUrl = localStorage.getItem("redirectUrl");
    if (storedUrl) {
      // Clear storage first before navigation
      localStorage.removeItem("redirectUrl");
      setRedirectUrl(null);
      router.replace(storedUrl);
    }
  }, [router]); // Only depend on router, not redirectUrl

  // Clear redirect URL without navigating
  const clearRedirect = useCallback(() => {
    localStorage.removeItem("redirectUrl");
    setRedirectUrl(null);
  }, []);

  const currentPathWithQuery = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  const extendRoute = (segment: string) => {
    router.push(`${pathname}/${segment}`, { scroll: false });
  };

  const extendRouteWithQuery = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => params.set(key, value));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearQueryParam = (keysToRemove?: string[]) => {
    if (!keysToRemove) {
      router.replace(pathname, { scroll: false });
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    keysToRemove.forEach((key) => params.delete(key));
    const newQuery = params.toString();
    router.replace(newQuery ? `${pathname}?${newQuery}` : pathname, {
      scroll: false,
    });
  };

  const checkParams = (param: string): string | null => {
    return searchParams.get(param);
  };

  return {
    router,
    pathname,
    currentPath: pathname,
    currentPathWithQuery,
    searchParams,
    redirectUrl,
    setRedirectUrl: setRedirectUrlWithStorage,
    navigateToRedirect,
    clearRedirect,
    extendRoute,
    extendRouteWithQuery,
    clearQueryParam,
    checkParams,
  };
};

export const clearRedirectFromStorage = () => {
  localStorage.removeItem("redirectUrl");
};
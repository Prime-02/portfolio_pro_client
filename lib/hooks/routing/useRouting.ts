import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useRouting = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State for storing redirect URLs
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Initialize from sessionStorage on mount
  useEffect(() => {
    const storedRedirect = sessionStorage.getItem("redirectUrl");
    if (storedRedirect) {
      setRedirectUrl(storedRedirect);
    }
  }, []);

  // Setter that syncs with sessionStorage
  const setRedirectUrlWithStorage = useCallback((url: string | null) => {
    setRedirectUrl(url);
    if (url) {
      sessionStorage.setItem("redirectUrl", url);
    } else {
      sessionStorage.removeItem("redirectUrl");
    }
  }, []);

  // Navigate to stored redirect URL and clear it
  const navigateToRedirect = useCallback(() => {
    if (redirectUrl) {
      router.push(redirectUrl);
      setRedirectUrl(null);
      sessionStorage.removeItem("redirectUrl");
    }
  }, [redirectUrl, router]);

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
    extendRoute,
    extendRouteWithQuery,
    clearQueryParam,
    checkParams,
  };
};

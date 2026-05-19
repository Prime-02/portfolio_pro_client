import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useRouting = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    extendRoute,
    extendRouteWithQuery,
    clearQueryParam,
    checkParams,
  };
};

"use client";
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";
import {
  GetAllData,
  PostAllData,
} from "./components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "./components/utilities/indices/urls";
import {
  TokenData,
  User,
} from "./components/types and interfaces/UserAndProfile";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "./components/toastify/Toastify";
import { PathUtil } from "./components/utilities/syncFunctions/syncs";

// Define the default user data
export const defaultUserData: User = {
  id: "",
  username: "",
  firstname: "",
  middlename: "",
  lastname: "",
  profile_picture: null,
  profile_picture_id: "",
  phone_number: "",
  is_active: true,
  role: "user",
  email: "",
  is_superuser: false,
  created_at: "",
  updated_at: "",
};

// Define the type for the global state
interface GlobalStateContextType {
  userData: User;
  setUserData: (userData: User | ((prev: User) => User)) => void;
  accessToken: string;
  logOut: () => void;
  setAccessToken: (
    session_token: string,
    refresh_token: string,
    expires_at: string
  ) => void;
  loading: string[];
  setLoading: (
    value: string,
    setArray?: Dispatch<SetStateAction<string[]>>
  ) => void;
  fetchUserData: (access?: string) => Promise<void>;
  router: AppRouterInstance;
  currentPath: string;
  pathname: string;
  currentPathWithQuery: string;
  extendRoute: (segment: string) => void;
  searchParams: ReadonlyURLSearchParams;
  extendRouteWithQuery: (newParams: Record<string, string>) => void;
  clearQuerryParam: () => void;
  unauthorizedWarning: () => void;
  checkUsernameAvailability: (username: string) => Promise<boolean | undefined>;
  currentUser: string | undefined;
  getCurrentUser: () => void;
  setCurrentUser: (currentUser: string | undefined) => void;
  checkValidId: (id: string) => boolean;
  checkParams: (param: string) => string | null;
  viewportWidth: number;
  setViewportWidth: (value: number) => void;
  isOnline: boolean;
  isLoading: (value: string) => boolean;
}

// Context initialization
const GlobalStateContext = createContext<GlobalStateContextType | undefined>(
  undefined
);

// Constants
const TOKEN_STORAGE_KEY = "session_token_data";

// Utility function to save token data
const saveTokenData = (
  session_token: string,
  refresh_token: string,
  expires_at: string
): void => {
  if (typeof window === "undefined") return;

  try {
    const tokenData: TokenData = {
      session_token,
      refresh_token,
      expires_at,
      saved_at: Date.now(),
    };
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
    console.log("Token data saved successfully");
  } catch (error) {
    console.error("Error saving token data:", error);
  }
};

// Utility function to retrieve token data
const getTokenData = (): TokenData | null => {
  if (typeof window === "undefined") return null;

  try {
    const storedData = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedData) return null;

    const tokenData: TokenData = JSON.parse(storedData);
    return tokenData;
  } catch (error) {
    console.error("Error retrieving token data:", error);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
};

// Utility function to check if token is expired or expiring today
const checkTokenExpiry = (
  expires_at: string
): { isExpired: boolean; isExpiringToday: boolean } => {
  try {
    const expiryDate = new Date(expires_at);
    const now = new Date();

    // Check if token has already expired
    const isExpired = now >= expiryDate;

    // Check if token expires today (within 24 hours)
    const twentyFourHoursFromNow = new Date(
      now.getTime() + 24 * 60 * 60 * 1000
    );
    const isExpiringToday = expiryDate <= twentyFourHoursFromNow && !isExpired;

    return { isExpired, isExpiringToday };
  } catch (error) {
    console.error("Error checking token expiry:", error);
    return { isExpired: true, isExpiringToday: false };
  }
};

// Utility function to clear token
const clearToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

// Provider component
export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<User>(defaultUserData);
  const [accessToken, setAccessToken] = useState<string>("");
  const [refreshToken, setRefreshToken] = useState<string>("");
  const [loading, _setLoading] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<string | undefined>("");
  const [viewportWidth, setViewportWidth] = useState(0);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPath = usePathname();
  const pathname = usePathname();
  const currentUserName = PathUtil.getPathSegment(currentPath, 0);

  // Compute currentPathWithQuery
  const currentPathWithQuery = searchParams.toString()
    ? `${currentPath}?${searchParams.toString()}`
    : currentPath;

  // Effect to monitor online/offline status
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const fetchUserData = async (access: string = accessToken): Promise<void> => {
    if (!access) {
      console.warn("No access token provided for fetchUserData");
      return;
    }

    setLoading("fetching_user_data");
    try {
      const userDataUrl = `${V1_BASE_URL}/settings/info`;

      const userDataRes = await GetAllData<undefined, User>({
        access,
        url: userDataUrl,
        type: "User Data",
      });

      if (userDataRes) {
        const newUserData: User = {
          id: userDataRes.id ?? "",
          username: userDataRes.username ?? "",
          email: userDataRes.email ?? "",
          is_superuser: userDataRes.is_superuser ?? false,
          firstname: userDataRes.firstname ?? "",
          middlename: userDataRes.middlename ?? "",
          lastname: userDataRes.lastname ?? "",
          profile_picture: userDataRes.profile_picture ?? null,
          profile_picture_id: userDataRes.profile_picture_id ?? "",
          phone_number: userDataRes.phone_number ?? "",
          is_active: userDataRes.is_active ?? true,
          role: userDataRes.role ?? "user",
          created_at: userDataRes.created_at ?? "",
          updated_at: userDataRes.updated_at ?? "",
        };

        setUserData(newUserData);
      } else {
        console.log("No User Info Recovered");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading("fetching_user_data");
    }
  };

  // Refresh token function
  const performTokenRefresh = async (
    refresh_token: string
  ): Promise<boolean> => {
    setLoading("refreshing_token");
    try {
      const refreshRes: {
        session_token: string;
        refresh_token: string;
        expires_at: string;
      } = await PostAllData({
        access: refresh_token,
        url: `${V1_BASE_URL}/sessions/refresh`,
        data: { refresh_token: refresh_token },
      });

      if (refreshRes && refreshRes.session_token) {
        // Save the new token data
        saveTokenData(
          refreshRes.session_token,
          refreshRes.refresh_token,
          refreshRes.expires_at
        );
        setAccessToken(refreshRes.session_token);
        setRefreshToken(refreshRes.refresh_token);
        console.log("Token refreshed successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    } finally {
      setLoading("refreshing_token");
    }
  };

  // Enhanced setAccessToken function
  const updateAccessToken = useCallback(
    (session_token: string, refresh_token: string, expires_at: string) => {
      setAccessToken(session_token);
      setRefreshToken(refresh_token);

      if (session_token && refresh_token && expires_at) {
        saveTokenData(session_token, refresh_token, expires_at);
      } else {
        clearToken();
      }
    },
    []
  );

  // Effect for initial load and token validation
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tokenData = getTokenData();

      if (tokenData) {
        const { isExpired, isExpiringToday } = checkTokenExpiry(
          tokenData.expires_at
        );

        if (isExpired) {
          // Token expired, try to refresh
          console.log("Token expired, attempting refresh...");
          performTokenRefresh(tokenData.refresh_token).then((success) => {
            if (!success) {
              // Refresh failed, redirect to login
              clearToken();
              if (!checkParams("auth_mode")) {
                router.push("/user-auth?auth_mode=login");
              }
            }
          });
        } else if (isExpiringToday) {
          // Token expiring today, refresh proactively
          console.log("Token expiring today, refreshing proactively...");
          setAccessToken(tokenData.session_token);
          setRefreshToken(tokenData.refresh_token);
          performTokenRefresh(tokenData.refresh_token);
        } else {
          // Token is still valid
          setAccessToken(tokenData.session_token);
          setRefreshToken(tokenData.refresh_token);
          if (isOnline) {
            fetchUserData(tokenData.session_token);
          }
        }
      } else {
        // No token found, redirect to login
        if (!checkParams("auth_mode")) {
          router.push("/user-auth?auth_mode=login");
        }
      }
    }
  }, [isOnline]);

  // Effect to periodically check token expiry (every hour)
  useEffect(() => {
    if (!accessToken || !refreshToken) return;

    const checkInterval = setInterval(
      () => {
        const tokenData = getTokenData();
        if (tokenData) {
          const { isExpired, isExpiringToday } = checkTokenExpiry(
            tokenData.expires_at
          );

          if (isExpired || isExpiringToday) {
            console.log("Token check: Refreshing token...");
            performTokenRefresh(tokenData.refresh_token);
          }
        }
      },
      60 * 60 * 1000
    ); // Check every hour

    return () => clearInterval(checkInterval);
  }, [accessToken, refreshToken]);

  // Effect to log token info
  useEffect(() => {
    const tokenData = getTokenData();
    if (tokenData && accessToken) {
      try {
        const expiryDate = new Date(tokenData.expires_at);
        const now = new Date();
        const hoursUntilExpiry =
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        console.log("=== Token Info ===");
        console.log("Session Token:", accessToken);
        console.log("Expires At:", tokenData.expires_at);
        console.log("Hours Until Expiry:", hoursUntilExpiry.toFixed(2));
      } catch (error) {
        console.error("Error logging token info:", error);
      }
    }
  }, [accessToken]);

  const logOut = async () => {
    setLoading("logging_out");
    try {
      const logOutRes: { message: string } = await PostAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/sessions/revoke`,
      });
      if (logOutRes && logOutRes.message) {
        router.push("/user-auth?auth_mode=login");
        setAccessToken("");
        setRefreshToken("");
        clearToken();

        const newUserData: User = {
          id: "",
          username: "",
          email: "",
          is_superuser: false,
          firstname: "",
          middlename: "",
          lastname: "",
          profile_picture: null,
          profile_picture_id: "",
          phone_number: "",
          is_active: true,
          role: "user",
          created_at: "",
          updated_at: "",
        };

        setUserData(newUserData);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setLoading("logging_out");
    }
  };

  /**
   * Used to make a central multi-linked loading points for different async activities
   * @param value the string you pass in to either add to the array or remove it
   * @param setArray the optional setter function (as the _setLoader is already present)
   */
  const setLoading = (
    value: string,
    setArray: Dispatch<SetStateAction<string[]>> = _setLoading
  ): void => {
    setArray((prevArray) => {
      if (prevArray.includes(value)) {
        return prevArray.filter((item) => item !== value);
      }
      return [...prevArray, value];
    });
  };

  const isLoading = (value: string) => {
    return loading.includes(value);
  };

  useEffect(() => {
    console.log("Current Loading State:", loading);
  }, [loading]);

  const extendRoute = (segment: string) => {
    const newPath = `${currentPath}/${segment}`;
    router.push(newPath, { scroll: false });
  };

  const extendRouteWithQuery = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      params.set(key, value);
    });

    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  };

  const clearQuerryParam = () => {
    router.replace(pathname, { scroll: false });
  };

  const unauthorizedWarning = () => {
    if (!accessToken) {
      toast.warning(
        "You're not supposed to be here without permission, please proceed to login or sign up"
      );
      return;
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    if (!username) {
      toast.error("No username provided");
      return;
    }
    setLoading("checking_username");
    try {
      const isAvailable: { available: boolean } = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/user-multistep-form/check-username?username=${username}`,
      });
      if (isAvailable && isAvailable.available) {
        return isAvailable.available;
      }
    } catch (error) {
      console.log("Error checking username:", error);
      return false;
    } finally {
      setLoading("checking_username");
    }
  };

  const getCurrentUser = async () => {
    if (!currentUserName || !userData.username) {
      setCurrentUser(undefined);
      return;
    }
    if (currentUserName === userData.username) {
      setCurrentUser(undefined);
      return;
    }
    setLoading("finding_user");
    try {
      const currentUserRes: {
        available: boolean;
        username: string;
        requested_by: string;
      } = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/user-multistep-form/check-username?username=${currentUserName}`,
      });
      if (currentUserRes) {
        console.log(
          `Current User: ${currentUserName} Check Result:`,
          currentUserRes
        );
      }
      if (
        !currentUserRes.available &&
        currentUserRes.username &&
        currentUserRes.username !== currentUserRes.requested_by
      ) {
        setCurrentUser(currentUserRes.username);
        return currentUserRes.username;
      }
    } catch (error) {
      setCurrentUser(undefined);
      console.log(error);
    } finally {
      setLoading("finding_user");
    }
  };

  useEffect(() => {
    if (isOnline && accessToken && userData.username) {
      getCurrentUser();
    }
  }, [currentPath, isOnline, accessToken, userData.username]);

  const checkValidId = (id: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id
    );
  };

  const checkParams = (param: string) => {
    return searchParams.get(param);
  };

  const contextValue: GlobalStateContextType = {
    userData,
    logOut,
    setUserData,
    setAccessToken: updateAccessToken,
    accessToken,
    loading,
    setLoading,
    fetchUserData,
    router,
    currentPath,
    pathname,
    currentPathWithQuery,
    extendRoute,
    searchParams,
    extendRouteWithQuery,
    clearQuerryParam,
    unauthorizedWarning,
    checkUsernameAvailability,
    currentUser,
    setCurrentUser,
    getCurrentUser,
    checkValidId,
    checkParams,
    viewportWidth,
    setViewportWidth,
    isOnline,
    isLoading,
  };

  return (
    <GlobalStateContext.Provider value={contextValue}>
      {currentUser && (
        <span className="absolute z-50 left-0 top-0">{currentUser}</span>
      )}
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

// Additional utility hooks for specific parts of the global state
export const useUserData = (): User => {
  const { userData } = useGlobalState();
  return userData;
};

export const useAccessToken = (): string => {
  const { accessToken } = useGlobalState();
  return accessToken;
};

export const useLoading = (): [string[], (value: string) => void] => {
  const { loading, setLoading } = useGlobalState();
  return [loading, setLoading];
};

export const useFetchUserData = (): (() => Promise<void>) => {
  const { fetchUserData } = useGlobalState();
  return fetchUserData;
};

// New utility hook for online status
export const useIsOnline = (): boolean => {
  const { isOnline } = useGlobalState();
  return isOnline;
};

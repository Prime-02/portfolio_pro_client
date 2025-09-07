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
import { GetAllData } from "./components/utilities/asyncFunctions/lib/crud";
import { BASE_URL, V1_BASE_URL } from "./components/utilities/indices/urls";
import { User } from "./components/types and interfaces/UserAndProfile";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "./components/toastify/Toastify";
import { getCurrentUrl } from "./components/utilities/syncFunctions/syncs";

// Define types for user data
export interface UserData extends User {
  auth_id?: string;
}

// Define the default user data
const defaultUserData: UserData = {
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
  userData: UserData;
  setUserData: (userData: UserData | ((prev: UserData) => UserData)) => void;
  accessToken: string;
  mockLogOut: () => void;
  setAccessToken: (token: string) => void;
  loading: string[];
  setLoading: (
    value: string,
    setArray?: Dispatch<SetStateAction<string[]>>
  ) => void;
  fetchUserData: (access?: string) => Promise<void>;
  updateUserData: () => Promise<void>;
  router: AppRouterInstance;
  currentPath: string;
  pathname: string;
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
}

// Context initialization
const GlobalStateContext = createContext<GlobalStateContextType | undefined>(
  undefined
);

// Provider component
export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [accessToken, setAccessToken] = useState<string>("");
  const [loading, _setLoading] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<string | undefined>("");
  const searchParams = useSearchParams(); // current query params
  const router = useRouter();
  const currentPath = usePathname();
  const pathname = usePathname();

  const fetchUserData = async (access: string = accessToken): Promise<void> => {
    if (!access) {
      console.warn("No access token provided for fetchUserData");
      return;
    }

    setLoading("fetching_user_data");
    try {
      const userDataUrl = currentUser
        ? `${BASE_URL}/api/v1/settings/info/${currentUser}`
        : `${BASE_URL}/api/v1/settings/info`;

      const userDataRes = await GetAllData<undefined, UserData>({
        access,
        url: userDataUrl,
        type: "User Data",
      });

      if (userDataRes) {
        const newUserData: UserData = {
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
        console.log("Client User Data: ", userDataRes);
      } else {
        console.log("No User Info Recovered");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading("fetching_user_data");
    }
  };

  // Simple user data update function to be used by other components
  const updateUserData = async (token = accessToken): Promise<void> => {
    if (!token) {
      console.warn("No access token available for updateUserData");
      return;
    }

    await fetchUserData(token);
  };

  // Effect for initial load (mount)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("session_token");
      if (token) {
        setAccessToken(token);
        updateUserData(token);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (accessToken) {
        localStorage.setItem("session_token", accessToken);
      } else {
        localStorage.removeItem("session_token");
      }
    }
    console.log("Token: ", accessToken);
    
  }, [accessToken]);

  const mockLogOut = () => {
    setAccessToken("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("session_token");
    }
    const newUserData: UserData = {
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
  };

  /**
   * Used to make a central multi-linked loading points for different async activities
   * @param value the string you pass in to either add to the array or remove it
   * @param setArray the optional setter function (as the _setLoader is already present)
   */
  const setLoading = useCallback(
    (
      value: string,
      setArray: Dispatch<SetStateAction<string[]>> = _setLoading
    ): void => {
      setArray((prevArray) => {
        if (prevArray.includes(value)) {
          return prevArray.filter((item) => item !== value);
        }
        return [...prevArray, value];
      });
    },
    []
  );

  const extendRoute = (segment: string) => {
    const newPath = `${currentPath}/${segment}`; // Constructs '/desktop/home'
    router.push(newPath, { scroll: false }); // Navigates to the new path
  };

  const extendRouteWithQuery = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Append new query params
    Object.entries(newParams).forEach(([key, value]) => {
      params.set(key, value);
    });

    // Construct the new URL
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  };

  const clearQuerryParam = () => {
    router.replace(pathname, { scroll: false });
  };

  const unauthorizedWarning = () => {
    if (!accessToken) {
      toast.warning(
        "You're not supposed to be here without permission, please proceed to logn or sign up "
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
    setLoading("finding_user");
    const currentUserName = getCurrentUrl("pathSegment", 0);
    if (!currentUserName) {
      toast.error(
        "Something went wrong... please as for the link to be resent "
      );
      setCurrentUser(undefined);
      return;
    }
    if (currentUserName === userData.username) {
      setCurrentUser(undefined);
      return;
    }
    try {
      const currentUserRes: {
        available: boolean;
        username: string;
        requested_by: string;
      } = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/user-multistep-form/check-username?username=${currentUserName}`,
      });
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
    mockLogOut,
    setUserData,
    setAccessToken,
    accessToken,
    loading,
    setLoading,
    fetchUserData,
    updateUserData,
    router,
    currentPath,
    pathname,
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
  };

  return (
    <GlobalStateContext.Provider value={contextValue}>
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
export const useUserData = (): UserData => {
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

export const useUpdateUserData = (): (() => Promise<void>) => {
  const { updateUserData } = useGlobalState();
  return updateUserData;
};

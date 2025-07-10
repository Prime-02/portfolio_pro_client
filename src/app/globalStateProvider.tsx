"use client";
import { useAuth } from "@clerk/clerk-react";
import { useUser } from "@clerk/nextjs";
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
  UpdateAllData,
} from "./components/utilities/asyncFunctions/lib/crud";
import { BASE_URL } from "./components/utilities/indices/urls";
import { AuthTokenResponse } from "./components/types and interfaces/UserAndProfile";

// Define types for user data
export interface UserData {
  id: string;
  username: string;
  firstname: string;
  middlename: string;
  lastname: string;
  profile_picture: string | null;
  phone_number: string | null;
  is_active: boolean;
  role: string;
}

// Define the default user data
const defaultUserData: UserData = {
  id: "",
  username: "",
  firstname: "",
  middlename: "",
  lastname: "",
  profile_picture: null,
  phone_number: null,
  is_active: true,
  role: "user",
};

// Define types for API responses
interface UserDataResponse {
  id?: string;
  username?: string;
  firstname?: string;
  middlename?: string;
  lastname?: string;
  profile_picture?: string | null;
  phone_number?: string | null;
  is_active?: boolean;
  role?: string;
}

// Define clerk user data type
interface ClerkUserData {
  user: ReturnType<typeof useUser>["user"];
}

// Define the type for the global state
interface GlobalStateContextType {
  clerkUserData: ClerkUserData;
  userData: UserData;
  setUser: (userData: UserData) => void;
  accessToken: string;
  loading: string[];
  setLoading: (
    value: string,
    setArray?: Dispatch<SetStateAction<string[]>>
  ) => void;
  fetchUserData: () => Promise<void>;
  fetchServerAccess: () => Promise<void>;
}

// Context initialization
const GlobalStateContext = createContext<GlobalStateContextType | undefined>(
  undefined
);

// Provider component
export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const [clerkUserData, setClerkUserData] = useState<ClerkUserData>({
    user: null,
  });
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [accessToken, setAccessToken] = useState<string>("");
  const [loading, _setLoading] = useState<string[]>([]);

  const { userId } = useAuth();
  const { user } = useUser();

  // Memoized setUser function to prevent unnecessary re-renders
  const setUser = useCallback((newUserData: UserData): void => {
    setUserData(newUserData);
  }, []);

  // Type-safe user data fetching
  const fetchUserData = useCallback(
    async (access: string = accessToken): Promise<void> => {
      if (!access) {
        console.warn("No access token provided for fetchUserData");
        return;
      }

      setLoading("fetching_user_data");
      try {
        const userDataRes = await GetAllData<undefined, UserDataResponse>({
          access,
          url: `${BASE_URL}/api/v1/settings/info`,
          type: "User Data",
        });

        if (userDataRes) {
          const newUserData: UserData = {
            id: userDataRes.id ?? "",
            username: userDataRes.username ?? "",
            firstname: userDataRes.firstname ?? "",
            middlename: userDataRes.middlename ?? "",
            lastname: userDataRes.lastname ?? "",
            profile_picture: userDataRes.profile_picture ?? null,
            phone_number: userDataRes.phone_number ?? null,
            is_active: userDataRes.is_active ?? true,
            role: userDataRes.role ?? "user",
          };

          setUser(newUserData);
          console.log("Client User Data: ", userDataRes);
        } else {
          console.log("No User Info Recovered");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading("fetching_user_data");
      }
    },
    [accessToken, setUser]
  );

  // Type-safe user data updating
  const updateUserData = useCallback(
    async (access: string = accessToken): Promise<void> => {
      if (!access) {
        console.warn("No access token provided for updateUserData");
        return;
      }

      if (!user) {
        console.warn("No clerk user data available for update");
        return;
      }

      setLoading("updating_user_data");
      try {
        const updatePayload = {
          username: user.username ?? undefined,
          firstname: user.firstName ?? undefined,
          lastname: user.lastName ?? undefined,
          profile_picture: user.imageUrl ?? undefined,
          phone_number: user.phoneNumbers?.[0]?.phoneNumber ?? undefined,
        };

        const updateRes = await UpdateAllData<
          typeof updatePayload,
          UserDataResponse
        >({
          access,
          field: updatePayload,
          url: `${BASE_URL}/api/v1/settings/info`,
          message: "custom", // Prevent automatic toast
        });

        if (updateRes) {
          await fetchUserData(access);
        }
      } catch (error) {
        console.error("Error updating user data:", error);
      } finally {
        setLoading("updating_user_data");
      }
    },
    [accessToken, user, fetchUserData]
  );

  // Type-safe server access fetching
  const fetchServerAccess = useCallback(async (): Promise<void> => {
    if (!userId) {
      console.warn("No clerk user ID available for fetchServerAccess");
      return;
    }

    setLoading("fetching_access_token");
    try {
      const serverAccessRes: AuthTokenResponse = await PostAllData({
        access: "",
        url: `${BASE_URL}/api/v1/clerk/exchange?clerk_id=${userId}`,
      });

      if (serverAccessRes?.access_token) {
        setAccessToken(serverAccessRes.access_token);
        console.log("Access Token: ", serverAccessRes.access_token);

        // Fetch user data immediately after getting access token
        await Promise.all([
          fetchUserData(serverAccessRes.access_token),
          updateUserData(serverAccessRes.access_token),
        ]);
      } else {
        console.warn("No access token received from server");
      }
    } catch (error) {
      console.error("Error fetching server access:", error);
    } finally {
      setLoading("fetching_access_token");
    }
  }, [userId, fetchUserData, updateUserData]);

  // Initialize clerk user data and fetch server access
  useEffect(() => {
    if (userId && user) {
      setClerkUserData({ user });
      fetchServerAccess();
    }
  }, [userId, user, fetchServerAccess]);

  // Debug logging for clerk user data
  useEffect(() => {
    console.log("User Data: ", clerkUserData);
  }, [clerkUserData]);

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

  const contextValue: GlobalStateContextType = {
    clerkUserData,
    userData,
    setUser,
    accessToken,
    loading,
    setLoading,
    fetchUserData,
    fetchServerAccess,
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

export const useClerkUserData = (): ClerkUserData => {
  const { clerkUserData } = useGlobalState();
  return clerkUserData;
};

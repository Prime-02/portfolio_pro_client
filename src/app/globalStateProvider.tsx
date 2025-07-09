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
} from "react";
import {
  GetAllData,
  PostAllData,
  PostAllDataParams,
  UpdateAllData,
} from "./components/utilities/asyncFunctions/lib/crud";
import { BASE_URL } from "./components/utilities/indices/urls";

// Define types for user data
export type UserData = {
  id: string;
  username: string;
  firstname: string;
  middlename: string;
  lastname: string;
  profile_picture: string | null;
  phone_number: string | null;
  is_active: boolean;
  role: string;
};

type ClerkUserData = {
  user: ReturnType<typeof useUser>["user"];
};

// Define the type for the global state
type GlobalStateContextType = {
  clerkUserData: ClerkUserData;
  userData: UserData;
  setUser: (userData: UserData) => UserData;
  accessToken: string;
  loading: string[];
  setLoading: (
    value: string,
    setArray?: Dispatch<SetStateAction<string[]>>
  ) => void;
  fetchUserData: () => Promise<void>;
  fetchServerAccess: () => Promise<void>;
};

// Context initialization
const GlobalStateContext = createContext<GlobalStateContextType | undefined>(
  undefined
);

// Provider component
export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const [clerkUserData, setClerkUserData] = useState<ClerkUserData>({
    user: null,
  });
  const [userData, setUser] = useState<UserData>({
    id: "",
    username: "",
    firstname: "",
    middlename: "",
    lastname: "",
    profile_picture: null,
    phone_number: null,
    is_active: true,
    role: "user",
  });
  const [accessToken, setAccessToken] = useState("");
  const [loading, _setLoading] = useState<string[]>([]);
  const { userId } = useAuth();
  const clerkUserId = userId;
  const { user } = useUser();

  const fetchUserData = async (access = accessToken) => {
    const accessToken = access;
    if (!accessToken) return;
    setLoading("fetching_user_data");
    try {
      const userDataRes = await GetAllData({
        access: accessToken,
        url: `${BASE_URL}/api/v1/settings/info`,
        type: "User Data",
      });

      if (userDataRes) {
        setUser({
          id: userDataRes.id || "",
          username: userDataRes.username || "",
          firstname: userDataRes.firstname || "",
          middlename: userDataRes.middlename || "",
          lastname: userDataRes.lastname || "",
          profile_picture: userDataRes.profile_picture || null,
          phone_number: userDataRes.phone_number || null,
          is_active:
            userDataRes.is_active !== undefined ? userDataRes.is_active : true,
          role: userDataRes.role || "user",
        });
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

  const fetchServerAccess = async () => {
    if (!clerkUserId) return;

    setLoading("fetching_access_token");
    try {
      const serverAccessRes = await PostAllData({
        access: "",
        url: `${BASE_URL}/api/v1/clerk/exchange?clerk_id=${clerkUserId}`,
      });

      if (serverAccessRes?.access_token) {
        setAccessToken(serverAccessRes.access_token);
        console.log("Access Token: ", serverAccessRes.access_token);
        // Fetch user data immediately after getting access token
        await Promise.all([
          fetchUserData(serverAccessRes.access_token),
          updateUserData(serverAccessRes.access_token),
        ]);
      }
    } catch (error) {
      console.error("Error fetching server access:", error);
    } finally {
      setLoading("fetching_access_token");
    }
  };

  const updateUserData = async (access = accessToken) => {
    const accessToken = access;
    setLoading("updating_user_data");
    try {
      const updateRes = await UpdateAllData({
        access: accessToken,
        field: {
          username: user?.username,
          firstname: user?.firstName,
          lastname: user?.lastName,
          profile_picture: user?.imageUrl,
          phone_number: user?.phoneNumbers[0]?.phoneNumber,
        },
        url: `${BASE_URL}/api/v1/settings/info`,
      });
      if (updateRes) {
        await fetchUserData(accessToken);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading("updating_user_data");
    }
  };

  useEffect(() => {
    if (clerkUserId && user) {
      setClerkUserData({
        user: user,
      });
      fetchServerAccess();
    }
  }, [clerkUserId, user]);

  useEffect(() => {
    console.log("User Data: ", clerkUserData);
  }, [clerkUserData]);

  /**
   * Used to make a central multi-linked loading points for different async activities
   * @param value the string you pass in to either add to the array or remove it
   * @param setArray the optional setter function (as the _setLoader is already present)
   */
  function setLoading(
    value: string,
    setArray: Dispatch<SetStateAction<string[]>> = _setLoading
  ): void {
    setArray((prevArray) => {
      if (prevArray.includes(value)) {
        return prevArray.filter((item) => item !== value);
      }
      return [...prevArray, value];
    });
  }

  return (
    <GlobalStateContext.Provider
      value={{
        clerkUserData,
        userData,
        setUser,
        accessToken,
        loading,
        setLoading,
        fetchUserData,
        fetchServerAccess,
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

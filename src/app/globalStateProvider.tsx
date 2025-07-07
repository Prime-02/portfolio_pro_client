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
  accessToken: string;
  loading: string[];
  setLoading: (value: string) => void;
  fetchUserData: () => Promise<void>;
  fetchServerAccess: () => Promise<void>;
};

// Global state manager for external usage
class GlobalStateManager {
  private listeners: Set<(state: GlobalStateContextType) => void> = new Set();
  private state: GlobalStateContextType;

  constructor() {
    this.state = {
      clerkUserData: { user: null },
      userData: {
        id: "",
        username: "",
        firstname: "",
        middlename: "",
        lastname: "",
        profile_picture: null,
        phone_number: null,
        is_active: true,
        role: "user",
      },
      accessToken: "",
      loading: [],
      setLoading: this.setLoading.bind(this),
      fetchUserData: this.fetchUserData.bind(this),
      fetchServerAccess: this.fetchServerAccess.bind(this),
    };
  }

  subscribe(listener: (state: GlobalStateContextType) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  private updateState(updates: Partial<GlobalStateContextType>) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  // Setters for external use
  setClerkUserData(clerkUserData: ClerkUserData) {
    this.updateState({ clerkUserData });
  }

  setUserData(userData: UserData) {
    this.updateState({ userData });
  }

  setAccessToken(accessToken: string) {
    this.updateState({ accessToken });
  }

  setLoadingArray(loading: string[]) {
    this.updateState({ loading });
  }

  /**
   * Used to make a central multi-linked loading points for different async activities
   * @param value the string you pass in to either add to the array or remove it
   */
  setLoading(value: string): void {
    const currentLoading = this.state.loading;
    let newLoading: string[];

    if (currentLoading.includes(value)) {
      newLoading = currentLoading.filter((item) => item !== value);
    } else {
      newLoading = [...currentLoading, value];
    }

    this.updateState({ loading: newLoading });
  }

  async fetchUserData(access?: string) {
    const accessToken = access || this.state.accessToken;
    if (!accessToken) return;

    this.setLoading("fetching_user_data");

    try {
      const userDataRes = await GetAllData({
        access: accessToken,
        url: `${BASE_URL}/api/v1/settings/info`,
        type: "User Data",
      });

      if (userDataRes) {
        const userData: UserData = {
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
        };
        this.setUserData(userData);
        console.log("Client User Data: ", userDataRes);
      } else {
        console.log("No User Info Recovered");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      this.setLoading("fetching_user_data");
    }
  }

  async fetchServerAccess(clerkUserId?: string) {
    const userId = clerkUserId || this.getClerkUserId();
    if (!userId) return;

    this.setLoading("fetching_access_token");

    try {
      const serverAccessRes = await PostAllData({
        access: "",
        url: `${BASE_URL}/api/v1/clerk/exchange?clerk_id=${userId}`,
      });

      if (serverAccessRes?.access_token) {
        this.setAccessToken(serverAccessRes.access_token);
        console.log("Access Token: ", serverAccessRes.access_token);
        // Fetch user data immediately after getting access token
        await Promise.all([
          this.fetchUserData(serverAccessRes.access_token),
          this.updateUserData(serverAccessRes.access_token),
        ]);
      }
    } catch (error) {
      console.error("Error fetching server access:", error);
    } finally {
      this.setLoading("fetching_access_token");
    }
  }

  private async updateUserData(access?: string) {
    const accessToken = access || this.state.accessToken;
    const user = this.state.clerkUserData.user;

    if (!user || !accessToken) return;

    this.setLoading("updating_user_data");

    try {
      const updateRes = await UpdateAllData({
        access: accessToken,
        field: {
          username: user.username || "",
          firstname: user.firstName || "",
          lastname: user.lastName || "",
          profile_picture: user.imageUrl || "",
          phone_number: user.phoneNumbers?.[0]?.phoneNumber || null,
        },
        url: `${BASE_URL}/api/v1/settings/info`,
      });

      if (updateRes) {
        await this.fetchUserData(accessToken);
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    } finally {
      this.setLoading("updating_user_data");
    }
  }

  // Getters for external use
  getState(): GlobalStateContextType {
    return { ...this.state };
  }

  getClerkUserData(): ClerkUserData {
    return this.state.clerkUserData;
  }

  getUserData(): UserData {
    return this.state.userData;
  }

  getAccessToken(): string {
    return this.state.accessToken;
  }

  getLoading(): string[] {
    return this.state.loading;
  }

  isLoading(value: string): boolean {
    return this.state.loading.includes(value);
  }

  private getClerkUserId(): string | null {
    return this.state.clerkUserData.user?.id || null;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.state.accessToken && !!this.state.clerkUserData.user;
  }

  getUserFullName(): string {
    const { firstname, lastname } = this.state.userData;
    return `${firstname} ${lastname}`.trim();
  }

  hasRole(role: string): boolean {
    return this.state.userData.role === role;
  }

  // Initialize from external sources (useful for server-side or utility functions)
  async initializeFromClerk(clerkUserId: string, clerkUser: any) {
    this.setClerkUserData({ user: clerkUser });
    await this.fetchServerAccess(clerkUserId);
  }
}

// Global instance
const globalStateManager = new GlobalStateManager();

// External API - use these functions anywhere in your app
export const globalState = {
  // Getters
  getState: () => globalStateManager.getState(),
  getClerkUserData: () => globalStateManager.getClerkUserData(),
  getUserData: () => globalStateManager.getUserData(),
  getAccessToken: () => globalStateManager.getAccessToken(),
  getLoading: () => globalStateManager.getLoading(),
  isLoading: (value: string) => globalStateManager.isLoading(value),
  isAuthenticated: () => globalStateManager.isAuthenticated(),
  getUserFullName: () => globalStateManager.getUserFullName(),
  hasRole: (role: string) => globalStateManager.hasRole(role),

  // Setters
  setClerkUserData: (clerkUserData: ClerkUserData) =>
    globalStateManager.setClerkUserData(clerkUserData),
  setUserData: (userData: UserData) => globalStateManager.setUserData(userData),
  setAccessToken: (accessToken: string) =>
    globalStateManager.setAccessToken(accessToken),
  setLoading: (value: string) => globalStateManager.setLoading(value),

  // Actions
  fetchUserData: (access?: string) => globalStateManager.fetchUserData(access),
  fetchServerAccess: (clerkUserId?: string) =>
    globalStateManager.fetchServerAccess(clerkUserId),
  initializeFromClerk: (clerkUserId: string, clerkUser: any) =>
    globalStateManager.initializeFromClerk(clerkUserId, clerkUser),

  // Subscriptions
  subscribe: (listener: (state: GlobalStateContextType) => void) =>
    globalStateManager.subscribe(listener),
};

// Context initialization
const GlobalStateContext = createContext<GlobalStateContextType | undefined>(
  undefined
);

// Provider component
export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GlobalStateContextType>(
    globalStateManager.getState()
  );
  const { userId } = useAuth();
  const { user } = useUser();

  // Subscribe to global state changes
  useEffect(() => {
    const unsubscribe = globalStateManager.subscribe(setState);
    return unsubscribe;
  }, []);

  // Initialize when clerk data is available
  useEffect(() => {
    if (userId && user) {
      globalStateManager.setClerkUserData({ user });
      globalStateManager.fetchServerAccess(userId);
    }
  }, [userId, user]);

  useEffect(() => {
    console.log("User Data: ", state.clerkUserData);
  }, [state.clerkUserData]);

  return (
    <GlobalStateContext.Provider value={state}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Hook to use global state (for components inside the provider)
export const useGlobalState = (): GlobalStateContextType => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};

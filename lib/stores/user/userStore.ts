// stores/userStore.ts
import { api, isAuthenticated } from "@/lib/client/api";
import { User } from "@/src/app/components/types and interfaces/UserAndProfile";
import { create } from "zustand";

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

interface UserStore {
  userData: User;
  setUserData: (userData: User | ((prev: User) => User)) => void;
  fetchUserData: () => Promise<void>;
  resetUserData: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  userData: defaultUserData,

  setUserData: (userData) => {
    set((state) => ({
      userData:
        typeof userData === "function" ? userData(state.userData) : userData,
    }));
  },

  fetchUserData: async () => {
    if(!isAuthenticated())return
    try {
      const response = await api.get<User>("settings/info");

      if (response.data) {
        set({
          userData: {
            id: response.data.id ?? "",
            username: response.data.username ?? "",
            email: response.data.email ?? "",
            is_superuser: response.data.is_superuser ?? false,
            firstname: response.data.firstname ?? "",
            middlename: response.data.middlename ?? "",
            lastname: response.data.lastname ?? "",
            profile_picture: response.data.profile_picture ?? null,
            profile_picture_id: response.data.profile_picture_id ?? "",
            phone_number: response.data.phone_number ?? "",
            is_active: response.data.is_active ?? true,
            role: response.data.role ?? "user",
            created_at: response.data.created_at ?? "",
            updated_at: response.data.updated_at ?? "",
          },
        });
      } else {
        console.log("No User Info Recovered");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  },

  resetUserData: () => set({ userData: defaultUserData }),
}));

import { create } from "zustand";
import { Profile } from "@/app/components/types and interfaces/UserAndProfile";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";

interface UserProfileStore {
  userProfile: Profile;
  error: string | null;
  setUserProfile: (profile: Profile) => void;
  fetchUserProfile: (
    accessToken: string,
    currentUser?: string,
    setLoading?: (key: string) => void
  ) => Promise<void>;
  resetUserProfile: () => void;
}

const initialUserProfile: Profile = {
  user_id: "",
  github_username: "",
  bio: "",
  profession: "",
  job_title: "",
  years_of_experience: 0,
  website_url: "",
  location: "",
  open_to_work: true,
  availability: "",
  profile_picture: null,
  profile_picture_id: "",
};

export const useUserProfileStore = create<UserProfileStore>((set) => ({
  userProfile: initialUserProfile,
  error: null,

  setUserProfile: (profile: Profile) => {
    set({ userProfile: profile, error: null });
  },

  fetchUserProfile: async (
    accessToken: string,
    currentUser?: string,
    setLoading?: (key: string) => void
  ) => {
    if (setLoading) setLoading("fetching_user_profile");
    set({ error: null });

    const url = currentUser
      ? `${V1_BASE_URL}/settings/profile/${currentUser}`
      : `${V1_BASE_URL}/settings/profile`;

    try {
      const profileRes: Profile = await GetAllData({
        access: accessToken,
        url: url,
        type: "User Profile",
      });

      if (profileRes) {
        set({ userProfile: profileRes });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch user profile",
      });
    } finally {
      if (setLoading) setLoading("fetching_user_profile");
    }
  },

  resetUserProfile: () => {
    set({
      userProfile: initialUserProfile,
      error: null,
    });
  },
}));

import { toast } from "@/src/app/components/toastify/Toastify";
import { useRouting } from "../routing/useRouting";
import { api, isAuthenticated } from "@/lib/client/api";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const useValidation = () => {
  const { checkParams, pathname } = useRouting();
  const { userInfo: userData } = useUserSettings();

  const checkValidId = (id: string): boolean => UUID_REGEX.test(id);

  const unauthorizedWarning = (): void => {
    if (!isAuthenticated()) {
      toast.warning(
        "You're not supposed to be here without permission, please proceed to login or sign up",
      );
    }
  };

  // Default extraction function that gets the first path segment as username
  const defaultGetUsername = (path: string): string | null => {
    const segments = path.split("/").filter(Boolean);
    return segments[0] || null;
  };

  // Accept a function that extracts the profile username from the path
  const checkIfOwnProfile = (
    getProfileUsernameFromPath: (
      pathname: string,
    ) => string | null = defaultGetUsername,
  ): { isOwnProfile: boolean; username: string | null } | null => {
    const profileUsername = getProfileUsernameFromPath(pathname);
    if (!profileUsername) return null;

    const isOwnProfile =
      userData?.username?.toLowerCase() === profileUsername.toLowerCase();

    const data = {
      isOwnProfile,
      username: profileUsername,
    };

    return data;
  };

  const checkUsernameAvailability = async (
    username: string,
  ): Promise<{ available: boolean; exists: boolean }> => {
    if (!username) {
      toast.error("No username provided");
      return { available: false, exists: false };
    }

    try {
      const { data: res } = await api.get(
        `/user-multistep-form/check-username?username=${username}`,
      );

      return {
        available: res?.can_use,
        exists: res?.exists,
      };
    } catch {
      toast.error("Failed to validate username");
      return { available: false, exists: false };
    }
  };

  // New function to validate username and determine profile type
  const validateProfileUsername = async (
    username: string | null,
  ): Promise<{
    isValid: boolean;
    isOwnProfile: boolean;
    username: string | null;
  }> => {
    if (!username) {
      return { isValid: false, isOwnProfile: false, username: null };
    }

    // Check if it's own profile first (no need for API call)
    if (userData?.username?.toLowerCase() === username.toLowerCase()) {
      return { isValid: true, isOwnProfile: true, username };
    }

    // For other usernames, validate against backend
    const res = await checkUsernameAvailability(username);

    // If the username EXISTS in the database, it's a valid profile
    // If it doesn't exist, it's not a valid profile to visit
    return {
      isValid: res.exists, // True if profile exists (username is taken)
      isOwnProfile: false,
      username: res.exists ? username : null, // Return username only if profile exists
    };
  };

  return {
    checkValidId,
    unauthorizedWarning,
    checkUsernameAvailability,
    checkIfOwnProfile,
    validateProfileUsername,
    checkParams,
  };
};

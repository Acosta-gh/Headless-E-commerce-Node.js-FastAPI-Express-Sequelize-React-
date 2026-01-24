import { useState, useEffect, useCallback } from "react";
import {
  getProfile as getProfileService,
  updateUserProfile as updateUserProfileService,
} from "@/services/profile.services";
import { useAuth } from "@/hooks/useAuth";
import { jwtDecode } from "jwt-decode";

import { toast } from "sonner";

export const useProfile = () => {
  const { token, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /*
   * Fetch user profile data
   */
  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const decoded = jwtDecode(token);
      console.log("Token:", token);
      console.log("Decoded token:", decoded);
      console.log("Fetching profile for user ID:", decoded.id);
      const userProfile = await getProfileService(decoded.id, token);
      setProfile(userProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.response && error.response.status === 429) {
        setError(new Error("Rate limit exceeded. Please try again later."));
        toast.error("Rate limit exceeded. Please try again later.");
      } else {
        setError(error);
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "An error occurred";

        toast.error(errorMessage, {
          duration: 3000,
          action: {
            label: "Close",
            onClick: () => {},
          },
        });
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  /* 
  * Update user profile data
  @param {Object} profileData - Updated profile data
  */
  const updateProfile = useCallback(
    async (profileData) => {
      if (!token || !profile) return;
      setLoading(true);
      try {
        const updatedProfile = await updateUserProfileService(
          profile.id,
          profileData,
          token
        );
        console.log("Profile updated on backend:", updatedProfile);
        setProfile(updatedProfile);
        return updatedProfile;
      } catch (error) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "An error occurred";

        toast.error(errorMessage, {
          duration: 3000,
          action: {
            label: "Close",
            onClick: () => {},
          },
        });

        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [token, profile]
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [isAuthenticated, fetchProfile]);

  return {
    profile,
    setProfile,
    updateProfile,
    loading,
    error,
  };
};

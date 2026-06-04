import { useCallback, useState } from "react";

export function useSavedProfiles() {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveProfile = useCallback(async (advisorProfileId) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/advisor/saved-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advisorProfileId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save profile");
      }

      setIsSaved(true);
      return { success: true, data, message: data.message };
    } catch (err) {
      const errorMessage = err.message || "Failed to save profile";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeProfile = useCallback(async (advisorProfileId) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/advisor/saved-profiles/${advisorProfileId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to remove profile");
      }

      setIsSaved(false);
      return { success: true, data, message: data.message };
    } catch (err) {
      const errorMessage = err.message || "Failed to remove profile";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkSaveStatus = useCallback(async (advisorProfileId) => {
    try {
      const response = await fetch(
        `/api/advisor/saved-profiles/check/${advisorProfileId}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check save status");
      }

      setIsSaved(Boolean(data.data?.isSaved));
      return { isSaved: Boolean(data.data?.isSaved), error: null };
    } catch (err) {
      const errorMessage = err.message || "Failed to check save status";
      setError(errorMessage);
      return { isSaved: false, error: errorMessage };
    }
  }, []);

  const toggleSaveProfile = useCallback(
    async (advisorProfileId) => {
      if (isSaved) {
        return removeProfile(advisorProfileId);
      }
      return saveProfile(advisorProfileId);
    },
    [isSaved, removeProfile, saveProfile],
  );

  return {
    isSaved,
    isLoading,
    error,
    saveProfile,
    removeProfile,
    checkSaveStatus,
    toggleSaveProfile,
    setIsSaved,
  };
}

export function useFetchSavedProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfiles = useCallback(async (page = 1, limit = 10) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/advisor/saved-profiles?page=${page}&limit=${limit}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch saved profiles");
      }

      setProfiles(data.data || []);
      setPagination(data.pagination);
      return { success: true, data: data.data, pagination: data.pagination };
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch saved profiles";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    profiles,
    pagination,
    isLoading,
    error,
    fetchProfiles,
    refetch: fetchProfiles,
  };
}

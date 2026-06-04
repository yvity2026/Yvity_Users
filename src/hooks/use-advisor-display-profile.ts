"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthUserContext";
import {
  buildAdvisorDisplayProfile,
  type AdvisorDisplayProfile,
} from "@/lib/advisor-display-profile";

export function useAdvisorDisplayProfile(
  designation?: string,
): AdvisorDisplayProfile {
  const { user, advisor } = useAuth();
  return useMemo(
    () => buildAdvisorDisplayProfile({ user, advisor, designation }),
    [user, advisor, designation],
  );
}

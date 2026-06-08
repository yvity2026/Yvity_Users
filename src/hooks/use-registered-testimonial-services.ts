"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthUserContext";
import { usePublicProfileView } from "@/context/public-profile-view-context";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import {
  buildRegisteredTestimonialServiceOptions,
  buildTestimonialServiceFilterOptions,
  type TestimonialServiceFilterOption,
  type TestimonialServiceOption,
} from "@/lib/sections/testimonial-service-options";
import { useServicesData } from "@/lib/sections/stores";

type Scope = "public" | "all";

/** Testimonial service pickers derived from the advisor's saved service cards. */
export function useRegisteredTestimonialServices(scope: Scope = "public"): {
  serviceOptions: TestimonialServiceOption[];
  filterOptions: TestimonialServiceFilterOption[];
  loading: boolean;
} {
  const [services, , loading] = useServicesData();
  const publicView = usePublicProfileView();
  const { advisor } = useAuth();

  const profileApproved = publicView
    ? isAdvisorProfileApproved(publicView.profile)
    : isAdvisorProfileApproved(advisor);

  const builderOptions = useMemo(
    () => ({
      profileApproved,
      publicOnly: scope === "public",
    }),
    [profileApproved, scope],
  );

  const serviceOptions = useMemo(
    () => buildRegisteredTestimonialServiceOptions(services, builderOptions),
    [services, builderOptions],
  );

  const filterOptions = useMemo(
    () => buildTestimonialServiceFilterOptions(services, builderOptions),
    [services, builderOptions],
  );

  return { serviceOptions, filterOptions, loading };
}

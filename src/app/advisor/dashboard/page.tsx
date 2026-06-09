import { redirect } from "next/navigation";

/** Legacy bookmark URL — canonical advisor workspace is /advisor. */
export default function AdvisorDashboardLegacyRedirect() {
  redirect("/advisor");
}

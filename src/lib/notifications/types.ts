export type NotificationKind =
  | "profile_approved"
  | "profile_rejected"
  | "new_recommendation"
  | "new_testimonial";

export type AdvisorNotification = {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  message: string;
  href?: string;
  read: boolean;
  createdAt: string;
  meta?: Record<string, string>;
};

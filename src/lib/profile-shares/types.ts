export type ProfileShareKind = "self" | "client";

export type ProfileShareRecord = {
  id: string;
  advisorUserId: string;
  sharerUserId: string;
  kind: ProfileShareKind;
  createdAt: string;
};

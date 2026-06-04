export const IDENTITY_COPY = {
  banner: {
    due_soon: {
      title: "Your annual identity refresh is coming up",
      body: "Once a year we confirm you're still the real you — so no one can misuse your account or leave fake reviews in your name. It takes about 2 minutes.",
    },
    grace: {
      title: "Please refresh your identity selfie",
      body: "Your annual verification window has opened. Some actions are paused until you complete a quick live selfie — this protects you from impersonation, not just our platform.",
    },
    overdue: {
      title: "Identity refresh needed to continue",
      body: "It's been over a year since your last live verification. You can still log in and browse, but reviews, contact, and advisor visibility stay paused until you refresh — for your account's safety.",
    },
  },
  blocked: {
    title: "Quick identity refresh needed",
    body: "YVITY checks once a year that you're still the real person behind this account. This stops fake profiles and stolen photos from harming you and others. Your profile photo can stay the same — only a live selfie is needed.",
    cta: "Refresh my identity",
  },
  refreshPage: {
    title: "Annual identity refresh",
    subtitle:
      "One live selfie per year keeps your account trusted. Your public profile photo does not have to change.",
    why: "Fake accounts and AI photos are everywhere. This quick check proves you're still you — so your reviews and contacts stay protected.",
  },
  profilePhoto: {
    why: "Confirm with OTP on both your mobile and email so only you can change what others see on your profile.",
  },
};

export function getBannerCopy(status: string) {
  return (
    IDENTITY_COPY.banner[status as keyof typeof IDENTITY_COPY.banner] ||
    IDENTITY_COPY.banner.due_soon
  );
}

"use client";

import { useState } from "react";

function getInitial(name) {
  return (
    String(name || "")
      .trim()
      .charAt(0)
      .toUpperCase() || "?"
  );
}

export default function UserProfileAvatar({
  src,
  name,
  size = 40,
  className = "",
  alt = "Profile photo",
}) {
  const initial = getInitial(name);
  const photoUrl = String(src || "").trim();
  const [imageError, setImageError] = useState(false);
  const showPhoto = Boolean(photoUrl) && !imageError;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-[#004D4D] text-white flex items-center justify-center font-semibold ${className}`}
      style={{ width: size, height: size }}
    >
      {showPhoto ? (
        <img
          src={photoUrl}
          alt={alt}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="select-none">{initial}</span>
      )}
    </div>
  );
}

"use client";

import SetupMyProfileFlow from "./SetupMyProfileFlow";

export default function SetupMyProfileModal({ isOpen, onClose, onComplete }) {
  return (
    <SetupMyProfileFlow
      isOpen={isOpen}
      onClose={onClose}
      onComplete={onComplete}
    />
  );
}

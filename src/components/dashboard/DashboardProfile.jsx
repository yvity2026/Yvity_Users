"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { StateCombobox } from "@/components/ui/state-combobox";
import { CityCombobox } from "@/components/ui/city-combobox";
import Link from "next/link";
import { CheckCircle2, Copy, ExternalLink, Link2, MapPin, Pencil, X } from "lucide-react";
import { FiLogOut } from "react-icons/fi";
import { toast } from "sonner";
import LandingSectionHeader from "@/yvity-landing/app/components/home/LandingSectionHeader";
import UserProfileAvatar from "@/components/user/UserProfileAvatar";
import ProfilePhotoModal from "@/components/dashboard/ProfilePhotoModal";
import {
  EmailModal,
  MobileModal,
} from "@/components/features/advisor/settings/settings-modals";
import { useAuth } from "@/context/AuthUserContext";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { isAdvisorRole } from "@/lib/dashboard/welcomeBanner";
import { HandlePicker } from "@/components/advisor/handle-picker";
import { buildPublicProfileUrl, toPublicProfileSlugSegment } from "@/lib/advisor/public-profile-slug";

const inputClass =
  "min-h-[40px] w-full rounded-lg border border-[#E4E2DB] bg-[#F8F6F1] px-3 py-2 font-poppins text-sm font-medium text-[#0A4A4A] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#0A4A4A] focus:bg-white focus:ring-1 focus:ring-[#0A4A4A]";

const inputDisabledClass =
  "min-h-[40px] w-full rounded-lg border border-[#E4E2DB] bg-[#F4F7F6] px-3 py-2 font-poppins text-sm font-medium text-[#374151]";

const labelClass =
  "mb-1 block font-poppins text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]";

function SectionBlock({ eyebrow, title, description, children, className = "" }) {
  return (
    <section className={className}>
      <div className="mb-2.5">
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className="font-poppins text-[10px] font-semibold uppercase tracking-[0.12em] text-[#F59E0B]">
            {eyebrow}
          </span>
          <span className="text-[#D1D5DB]">·</span>
          <h3 className="font-cormorant text-[17px] font-bold leading-tight text-[#0A4A4A] sm:text-lg">
            {title}
          </h3>
        </div>
        {description ? (
          <p className="mt-1 font-poppins text-xs leading-relaxed text-[#6B7280]">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ReadOnlyField({ label, value, hint }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <p className={`${inputDisabledClass} break-words`}>{value || "—"}</p>
      {hint ? (
        <p className="mt-1 font-poppins text-[10px] leading-relaxed text-[#6B7280]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function ContactField({ label, value, hint, onChange, changeLabel, editing }) {
  if (!editing) {
    return <ReadOnlyField label={label} value={value} hint={hint} />;
  }

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="overflow-hidden rounded-lg border border-[#E4E2DB] bg-white">
        <div className="min-h-[40px] break-all bg-[#F4F7F6] px-3 py-2 font-poppins text-sm font-medium text-[#374151]">
          {value || "—"}
        </div>
        <button
          type="button"
          onClick={onChange}
          className="flex min-h-[36px] w-full items-center justify-center border-t border-[#E4E2DB] font-poppins text-xs font-semibold text-[#0A4A4A] transition hover:bg-[#F8F6F1]"
        >
          {changeLabel}
        </button>
      </div>
      {hint ? (
        <p className="mt-1 font-poppins text-[10px] leading-relaxed text-[#6B7280]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[960px] animate-pulse px-3 py-3 sm:px-4">
      <div className="mb-3 h-8 w-48 rounded bg-[#E4E2DB]" />
      <div className="rounded-2xl border border-[#E4E2DB] bg-white p-4">
        <div className="h-16 w-16 rounded-full bg-[#E4E2DB]" />
        <div className="mt-4 space-y-3">
          <div className="h-10 rounded-lg bg-[#E4E2DB]" />
          <div className="h-10 rounded-lg bg-[#E4E2DB]" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardProfile() {
  const { user, advisor, setUser, setAdvisor } = useAuth();
  const { settings } = useAdvisorSettings();
  // advisor object from auth context is the reliable signal — user.roles may not be populated
  // Only treat as advisor when fully approved (active). Under-review / pending
  // profiles still show the customer view — advisor fields appear after approval.
  const isAdvisor =
    (!!advisor && String(advisor.account_status || "").toLowerCase() === "active") ||
    isAdvisorRole(user);
  const [isEditing, setIsEditing] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locationForm, setLocationForm] = useState({
    officeAddress: settings.location.officeAddress,
    mapsLink: settings.location.mapsLink,
  });
  const [locationSaving, setLocationSaving] = useState(false);

  // Handle / profile URL
  const [handleEditing, setHandleEditing] = useState(false);
  const [pendingHandle, setPendingHandle] = useState(null);
  const [handleSaving, setHandleSaving] = useState(false);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://yvity.com";
  const currentSegment = toPublicProfileSlugSegment(advisor?.profile_slug?.trim() ?? "");
  const profileUrl = currentSegment ? buildPublicProfileUrl(currentSegment, siteUrl) : null;
  const displayUrl = profileUrl ? profileUrl.replace(/^https?:\/\//, "") : null;

  const handleSaveHandle = useCallback(async () => {
    if (!pendingHandle) return;
    setHandleSaving(true);
    try {
      const res = await fetch("/api/advisor/handle", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: pendingHandle }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Could not update URL"); return; }
      setAdvisor(advisor ? { ...advisor, profile_slug: data.handle ?? pendingHandle } : advisor);
      toast.success("Profile URL updated!");
      setHandleEditing(false);
      setPendingHandle(null);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setHandleSaving(false);
    }
  }, [pendingHandle, advisor, setAdvisor]);

  useEffect(() => {
    setLocationForm({
      officeAddress: settings.location.officeAddress,
      mapsLink: settings.location.mapsLink,
    });
  }, [settings.location.officeAddress, settings.location.mapsLink]);

  const [form, setForm] = useState({
    name: "",
    profession: "",
    city: "",
    state: "",
    address_line: "",
    pincode: "",
    about: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      profession: user.profession || "",
      city: user.city || "",
      state: user.state || "",
      address_line: user.address_line || "",
      pincode: user.pincode || "",
      about: user.about || "",
    });
  }, [user]);

  const isDirty = useMemo(() => {
    if (!user) return false;
    const baseChanged =
      form.city !== (user.city || "") ||
      form.state !== (user.state || "") ||
      form.address_line !== (user.address_line || "") ||
      form.pincode !== (user.pincode || "") ||
      form.about !== (user.about || "");
    if (isAdvisor) return baseChanged;
    return baseChanged || form.name !== (user.name || "") || form.profession !== (user.profession || "");
  }, [form, user, isAdvisor]);

  const locationDisplay = [form.city, form.state].filter(Boolean).join(", ");

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    if (!user) return;
    setForm({
      name: user.name || "",
      profession: user.profession || "",
      city: user.city || "",
      state: user.state || "",
      address_line: user.address_line || "",
      pincode: user.pincode || "",
      about: user.about || "",
    });
  };

  const handleCancelEdit = () => {
    resetForm();
    setIsEditing(false);
  };

  const handleSaveLocation = async () => {
    setLocationSaving(true);
    try {
      const res = await fetch("/api/advisor/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: {
            officeAddress: locationForm.officeAddress.trim(),
            mapsLink: locationForm.mapsLink.trim(),
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Office location saved");
    } catch {
      toast.error("Could not save office location");
    } finally {
      setLocationSaving(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!isDirty) {
      toast.success("Profile is already up to date");
      setIsEditing(false);
      return;
    }
    setSaving(true);
    try {
      const payload = isAdvisor
        ? { name: form.name, city: form.city, state: form.state, address_line: form.address_line, pincode: form.pincode, about: form.about }
        : form;
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save profile");

      setUser?.(json.data || null);
      window.dispatchEvent(new CustomEvent("profile-data-updated"));
      toast.success(json.message || "Profile saved");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      window.location.href = data.redirect_url || "/";
    } catch {
      window.location.href = "/";
    }
  };

  if (!user) {
    return <ProfileSkeleton />;
  }

  const mobileDisplay = user.mobile ? `+91 ${user.mobile}` : "—";
  const displayName = form.name || user.name || "Your profile";

  return (
    <>
      <div
        className={`mx-auto w-full max-w-[960px] px-3 py-3 sm:px-4 sm:py-5 ${
          isEditing ? "pb-24 lg:pb-8" : "pb-6"
        }`}
      >
        <LandingSectionHeader
          eyebrow="My account"
          title="Profile & account"
          description="Your verification selfie is your profile photo. Change it with mobile and email OTP."
          className="mb-3 [&_h2]:text-[26px] [&_h2]:sm:text-[32px] [&_p]:hidden [&_p]:sm:block"
        />

        <form id="dashboard-profile-form" onSubmit={handleSave} className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-[#E5E0D6] bg-white shadow-[0_1px_8px_rgba(10,74,74,0.05)]">
            <div className="relative flex gap-3 p-3.5 pr-12 sm:p-4 sm:pr-14">
              <UserProfileAvatar
                src={user.selfie_url}
                name={user.name}
                size={64}
                className="shrink-0 ring-2 ring-[#F59E0B]"
              />
              <div className="min-w-0 flex-1">
                <h2 className="font-cormorant text-[18px] font-bold leading-snug text-[#1A3C34] break-words sm:text-[20px]">
                  {displayName}
                </h2>
                {form.profession ? (
                  <p className="mt-0.5 font-poppins text-[11px] font-medium text-[#C5A059] sm:text-xs">
                    {form.profession}
                  </p>
                ) : null}
                {locationDisplay ? (
                  <p className="mt-0.5 flex items-center gap-1 font-poppins text-[10px] text-[#6B7280] sm:text-[11px]">
                    <MapPin className="h-3 w-3 shrink-0 text-[#0A4A4A]/70" />
                    <span>{locationDisplay}</span>
                  </p>
                ) : null}
                <p className="mt-1 font-poppins text-[10px] leading-relaxed text-[#6B7280]">
                  From your identity verification. Optional change via OTP below.
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {user.mobile_verified ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-[#ECFDF5] px-1.5 py-0.5 font-poppins text-[9px] font-semibold text-[#047857]">
                      <CheckCircle2 size={9} />
                      Mobile
                    </span>
                  ) : null}
                  {user.email_verified ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-[#ECFDF5] px-1.5 py-0.5 font-poppins text-[9px] font-semibold text-[#047857]">
                      <CheckCircle2 size={9} />
                      Email
                    </span>
                  ) : null}
                </div>
              </div>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit profile"
                  className="absolute right-3 top-3.5 flex h-9 w-9 items-center justify-center rounded-full border border-[#0A4A4A] bg-white text-[#0A4A4A] shadow-sm transition hover:bg-[#F8F6F1] active:bg-[#F0EDE6] sm:right-4 sm:top-4"
                >
                  <Pencil size={15} strokeWidth={2.25} />
                </button>
              ) : null}
            </div>

            {isEditing ? (
              <div className="border-t border-[#E5E0D6] bg-[#F8F6F1] px-3.5 py-2 sm:px-4">
                <button
                  type="button"
                  onClick={() => setPhotoOpen(true)}
                  className="font-poppins text-xs font-semibold text-[#F59E0B] hover:text-[#D97706]"
                >
                  Change profile photo
                </button>
                <span className="mx-1.5 text-[#D1D5DB]">·</span>
                <span className="font-poppins text-[10px] text-[#6B7280]">
                  Mobile + email OTP required
                </span>
              </div>
            ) : null}

            <div className="space-y-4 border-t border-[#E5E0D6] p-3.5 sm:p-4">
              <SectionBlock
                eyebrow="Personal"
                title="Details"
                description={
                  isEditing && !isAdvisor
                    ? "Name and profession on your YVITY account."
                    : undefined
                }
              >
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Full name</label>
                    {isAdvisor ? (
                      <>
                        <p className={`${inputDisabledClass} break-words`}>
                          {form.name || "—"}
                        </p>
                        <p className="mt-1 font-poppins text-[10px] leading-relaxed text-[#6B7280]">
                          Name is locked to your IRDAI license. To update, resubmit your license documents.
                        </p>
                      </>
                    ) : isEditing ? (
                      <input
                        type="text"
                        required
                        minLength={2}
                        autoComplete="name"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className={inputClass}
                        placeholder="Your full name"
                      />
                    ) : (
                      <p className={`${inputDisabledClass} break-words`}>
                        {form.name || "—"}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Designation</label>
                    {isAdvisor ? (
                      <>
                        <p className={`${inputDisabledClass} break-words`}>
                          {advisor?.designation || form.profession || "—"}
                        </p>
                        <p className="mt-1 font-poppins text-[10px] leading-relaxed text-[#6B7280]">
                          Designation is set from your verified advisor profile.
                        </p>
                      </>
                    ) : isEditing ? (
                      <input
                        type="text"
                        autoComplete="organization-title"
                        value={form.profession}
                        onChange={(e) =>
                          updateField("profession", e.target.value)
                        }
                        className={inputClass}
                        placeholder="e.g. Insurance Advisor"
                      />
                    ) : (
                      <p className={`${inputDisabledClass} break-words`}>
                        {form.profession || "—"}
                      </p>
                    )}
                  </div>
                </div>
              </SectionBlock>

              <div className="border-t border-[#E5E0D6] pt-4">
                <SectionBlock
                  eyebrow="Contact"
                  title="Security"
                  description={
                    isEditing
                      ? "OTP goes to your new mobile or email only."
                      : undefined
                  }
                >
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <ContactField
                      label="Mobile number"
                      value={mobileDisplay}
                      hint={isEditing ? "OTP to new number." : undefined}
                      changeLabel="Change mobile"
                      editing={isEditing}
                      onChange={() => setMobileOpen(true)}
                    />
                    <ContactField
                      label="Email address"
                      value={user.email}
                      hint={isEditing ? "OTP to new inbox." : undefined}
                      changeLabel="Change email"
                      editing={isEditing}
                      onChange={() => setEmailOpen(true)}
                    />
                  </div>
                </SectionBlock>
              </div>

              <div className="border-t border-[#E5E0D6] pt-4">
                <SectionBlock
                  eyebrow="Location"
                  title="City & state"
                  description={isEditing ? "Personalizes your experience." : undefined}
                >
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>State / Union Territory</label>
                      {isEditing ? (
                        <StateCombobox
                          value={form.state}
                          onChange={(val) => updateField("state", val)}
                        />
                      ) : (
                        <p className={inputDisabledClass}>{form.state || "—"}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>City / Town</label>
                      {isEditing ? (
                        <CityCombobox
                          state={form.state}
                          value={form.city}
                          onChange={(val) => updateField("city", val)}
                        />
                      ) : (
                        <p className={inputDisabledClass}>{form.city || "—"}</p>
                      )}
                    </div>
                  </div>
                </SectionBlock>
              </div>

              <div className="border-t border-[#E5E0D6] pt-4">
                <SectionBlock
                  eyebrow="Address"
                  title="Full address"
                  description={isEditing ? "Optional." : undefined}
                >
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Street / area</label>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          autoComplete="street-address"
                          value={form.address_line}
                          onChange={(e) =>
                            updateField("address_line", e.target.value)
                          }
                          className={`${inputClass} min-h-[64px] resize-none py-2`}
                          placeholder="House no., street, area"
                        />
                      ) : (
                        <p
                          className={`${inputDisabledClass} min-h-[40px] whitespace-pre-wrap break-words py-2`}
                        >
                          {form.address_line || "—"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Pin code</label>
                      {isEditing ? (
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="postal-code"
                          maxLength={6}
                          value={form.pincode}
                          onChange={(e) =>
                            updateField(
                              "pincode",
                              e.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          className={inputClass}
                          placeholder="6-digit PIN"
                        />
                      ) : (
                        <p className={inputDisabledClass}>
                          {form.pincode || "—"}
                        </p>
                      )}
                    </div>
                  </div>
                </SectionBlock>
              </div>

              {isAdvisor ? (
                <div className="border-t border-[#E5E0D6] pt-4">
                  <SectionBlock
                    eyebrow="Public Profile"
                    title="Office Location"
                    description="Shown on your public profile with a Get Directions button. Add a Google Maps link for a precise pin."
                  >
                    <div className="space-y-2.5">
                      <div>
                        <label className={labelClass}>Office address</label>
                        <textarea
                          rows={2}
                          value={locationForm.officeAddress}
                          onChange={(e) => setLocationForm((f) => ({ ...f, officeAddress: e.target.value }))}
                          className={`${inputClass} min-h-[64px] resize-none py-2`}
                          placeholder="e.g. Plot 12, MG Road, Guntur, AP 522001"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Google Maps link <span className="normal-case text-[#9CA3AF]">(optional)</span></label>
                        <input
                          type="url"
                          value={locationForm.mapsLink}
                          onChange={(e) => setLocationForm((f) => ({ ...f, mapsLink: e.target.value }))}
                          className={inputClass}
                          placeholder="https://maps.app.goo.gl/..."
                        />
                        <p className="mt-1 font-poppins text-[10px] leading-relaxed text-[#6B7280]">
                          Open Google Maps → share your office pin → paste the link here. If provided, the Get Directions button uses this link directly.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveLocation}
                        disabled={locationSaving}
                        className="rounded-full bg-[#0A4A4A] px-5 py-2 font-poppins text-sm font-semibold text-[#F59E0B] hover:bg-[#083c3c] disabled:opacity-60"
                      >
                        {locationSaving ? "Saving…" : "Save Location"}
                      </button>
                    </div>
                  </SectionBlock>
                </div>
              ) : null}

              {/* Profile URL / Handle — advisor only */}
              {isAdvisor ? (
                <div className="border-t border-[#E5E0D6] pt-4">
                  <SectionBlock
                    eyebrow="Public Profile"
                    title="Your Profile URL"
                    description="Your personal YVITY link. Share it on WhatsApp, business cards, or social media."
                  >
                    {handleEditing ? (
                      <div className="space-y-3">
                        <HandlePicker
                          defaultHandle={currentSegment || undefined}
                          onChange={setPendingHandle}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleSaveHandle}
                            disabled={!pendingHandle || handleSaving}
                            className="rounded-full bg-[#0A4A4A] px-5 py-2 font-poppins text-sm font-semibold text-[#F59E0B] hover:bg-[#083c3c] disabled:opacity-60"
                          >
                            {handleSaving ? "Saving…" : "Save URL"}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setHandleEditing(false); setPendingHandle(null); }}
                            disabled={handleSaving}
                            className="inline-flex items-center gap-1 rounded-full border border-[#E4E2DB] px-4 py-2 font-poppins text-sm font-medium text-[#6B7280] hover:bg-[#F8F6F1]"
                          >
                            <X className="size-3.5" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : currentSegment && profileUrl ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 rounded-lg border border-[#E4E2DB] bg-[#F8F6F1] px-3 py-2.5">
                          <Link2 className="size-4 shrink-0 text-[#0A4A4A]" />
                          <span className="flex-1 truncate font-poppins text-sm font-semibold text-[#0A4A4A]">
                            {displayUrl}
                          </span>
                          <button
                            type="button"
                            aria-label="Copy URL"
                            onClick={() => { navigator.clipboard.writeText(profileUrl); toast.success("Profile URL copied!"); }}
                            className="rounded p-1 hover:bg-[#E4E2DB] transition"
                          >
                            <Copy className="size-3.5 text-[#6B7280]" />
                          </button>
                          <a
                            href={profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open profile"
                            className="rounded p-1 hover:bg-[#E4E2DB] transition"
                          >
                            <ExternalLink className="size-3.5 text-[#6B7280]" />
                          </a>
                          <button
                            type="button"
                            aria-label="Edit URL"
                            onClick={() => setHandleEditing(true)}
                            className="rounded p-1 hover:bg-[#E4E2DB] transition"
                          >
                            <Pencil className="size-3.5 text-[#6B7280]" />
                          </button>
                        </div>
                        <p className="font-poppins text-[10px] text-[#6B7280]">
                          Handle: <strong className="text-[#0A4A4A]">{currentSegment}</strong>. Click the pencil to change it.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-poppins text-sm text-[#6B7280]">
                          You haven&apos;t claimed a personal URL yet.
                        </p>
                        <button
                          type="button"
                          onClick={() => setHandleEditing(true)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#0A4A4A] px-5 py-2 font-poppins text-sm font-semibold text-[#F59E0B] hover:bg-[#083c3c]"
                        >
                          <Link2 className="size-4" /> Claim your URL
                        </button>
                      </div>
                    )}
                  </SectionBlock>
                </div>
              ) : null}

              {isAdvisor ? (
                <div className="border-t border-[#E5E0D6] pt-4">
                  <SectionBlock
                    eyebrow="About"
                    title="You"
                    description={isEditing ? "Optional, max 500 chars." : undefined}
                  >
                    {isEditing ? (
                      <>
                        <textarea
                          rows={3}
                          maxLength={500}
                          value={form.about}
                          onChange={(e) => updateField("about", e.target.value)}
                          className={`${inputClass} min-h-[72px] resize-none py-2`}
                          placeholder="A few lines about you."
                        />
                        <p className="mt-1 text-right font-poppins text-[10px] text-[#9CA3AF]">
                          {form.about.length}/500
                        </p>
                      </>
                    ) : (
                      <p
                        className={`${inputDisabledClass} min-h-[40px] whitespace-pre-wrap break-words py-2`}
                      >
                        {form.about || "—"}
                      </p>
                    )}
                  </SectionBlock>
                </div>
              ) : null}
            </div>
          </div>

          {isEditing ? (
            <div className="hidden items-center gap-2 lg:flex">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[#0A4A4A] px-5 py-2.5 font-poppins text-sm font-semibold text-[#F59E0B] hover:bg-[#083c3c] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save profile"}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="rounded-full border border-[#E4E2DB] px-4 py-2.5 font-poppins text-sm font-semibold text-[#0A4A4A] hover:bg-[#F8F6F1] disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          ) : (
            <Link
              href="/dashboard/my-space"
              className="hidden rounded-full border border-[#E4E2DB] px-4 py-2.5 font-poppins text-sm font-semibold text-[#0A4A4A] hover:bg-[#F8F6F1] lg:inline-flex"
            >
              Back to My Space
            </Link>
          )}

          <div className="rounded-2xl border border-[#FEE2E2] bg-[#FFFBFB] p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-poppins text-sm font-semibold text-[#991B1B]">
                  Sign out
                </p>
                <p className="font-poppins text-[10px] text-[#6B7280] sm:text-xs">
                  Log in again to access your dashboard.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#FEF2F2] px-3.5 font-poppins text-xs font-semibold text-[#EF5555] hover:bg-[#FEE2E2] sm:text-sm"
              >
                <FiLogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </form>
      </div>

      {isEditing ? (
        <div
          className="fixed inset-x-0 z-40 border-t border-[#E4E2DB] bg-white/95 px-3 py-2 backdrop-blur-md lg:hidden"
          style={{
            bottom: "calc(4.75rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="mx-auto flex max-w-[960px] items-center gap-2">
            <button
              type="submit"
              form="dashboard-profile-form"
              disabled={saving}
              className="min-h-[42px] flex-1 rounded-full bg-[#0A4A4A] px-4 py-2.5 font-poppins text-sm font-semibold text-[#F59E0B] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={saving}
              className="flex min-h-[42px] shrink-0 items-center justify-center rounded-full border border-[#E4E2DB] px-4 font-poppins text-sm font-semibold text-[#0A4A4A]"
            >
              Cancel
            </button>
          </div>
          {isDirty ? (
            <p className="mt-1 text-center font-poppins text-[10px] text-[#B45309]">
              Unsaved changes
            </p>
          ) : null}
        </div>
      ) : null}

      <ProfilePhotoModal
        isOpen={photoOpen}
        onClose={() => setPhotoOpen(false)}
        user={user}
        onPhotoUpdated={(selfieUrl) => {
          setUser?.((prev) =>
            prev ? { ...prev, selfie_url: selfieUrl } : prev,
          );
        }}
      />
      <MobileModal isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <EmailModal isOpen={emailOpen} onClose={() => setEmailOpen(false)} />
    </>
  );
}

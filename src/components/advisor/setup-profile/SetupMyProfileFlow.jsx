"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  CloudUpload,
  Download,
  FileText,
  Landmark,
  Lock,
  Trash2,
} from "lucide-react";
import {
  createEmptyServiceDetail,
  DEFAULT_CATEGORY_ID,
  DEFAULT_INDUSTRY_ID,
  getCategoryLabel,
  getIndustryLabel,
  getServiceLabel,
  getServicesForCategory,
  ONBOARDING_CATEGORIES,
  ONBOARDING_INDUSTRIES,
  SETUP_PROFILE_STEPS,
  resolveAdvisorRoleId,
} from "@/lib/advisor/setupOnboardingTaxonomy";
import {
  encodeCapacityMetadata,
  capacityIdForOnboarding,
} from "@/lib/advisor/serviceCapacity";
import { ServiceAccountTypePicker } from "@/components/advisor/service-account-type-picker";
import {
  LICENSE_HOLDER_CONSENT_HINT,
  LICENSE_HOLDER_DECLARATION,
  LICENSE_HOLDER_RELATIONSHIPS,
  relationshipLabel,
} from "@/lib/advisor/service-license-holder";
import {
  canGenerateLicenseHolderConsentPdf,
  downloadLicenseHolderConsentPdf,
} from "@/lib/advisor/license-holder-consent-pdf";
import { useAuth } from "@/context/AuthUserContext";
import {
  computeYearsSinceStartDate,
  formatExperienceFromStart,
} from "@/lib/sections/service-experience";
import { useRazorpayCheckout } from "@/hooks/use-razorpay-checkout";
import {
  AccordionSection,
  fieldClass,
  InfoNotice,
  labelClass,
  LuxuryChip,
  PrimaryContinueButton,
  selectClass,
  ServiceSelectChip,
  SetupModalProgress,
  SetupProfileLuxuryModal,
} from "./setup-profile-ui";
import { SetupPlanStep } from "./SetupPlanStep";
import { HandlePicker } from "@/components/advisor/handle-picker";
import { handleFromName } from "@/lib/advisor/handle";

const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fieldKey(serviceId, field) {
  return `${serviceId}.${field}`;
}

/** Scroll the first invalid field into view. */
function scrollToFirstInvalid(invalidFields) {
  setTimeout(() => {
    const firstKey = Object.keys(invalidFields)[0];
    if (!firstKey) return;
    const el = document.getElementById(`field-${firstKey}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 60);
}

function buildServicesPayload({ categoryId, selectedServices, serviceDetails, getServiceMeta }) {
  return selectedServices.map((serviceId) => {
    const meta = getServiceMeta(serviceId);
    const detail = serviceDetails[serviceId] ?? createEmptyServiceDetail();
    const startYear = detail.startDate ? String(detail.startDate).slice(0, 4) : null;

    return {
      service: meta?.apiType || meta?.label || "General Insurance",
      company: detail.company?.trim() || "",
      license: detail.licenseNumber?.trim() || "",
      experience: startYear ? new Date().getFullYear() - Number(startYear) : null,
      designation: detail.designation?.trim() || "",
      fromYear: detail.startDate || null,
      toYear: null, // only active services during onboarding
      numberOfClients: null,
      keyServices: [
        meta?.label || "Insurance",
        encodeCapacityMetadata(capacityIdForOnboarding(detail.professionalCapacity)),
      ].filter(Boolean),
      license_holder_type: detail.licenseHolderType === "other" ? "other" : "self",
      license_holder_name:
        detail.licenseHolderType === "other" ? detail.licenseHolderName?.trim() || "" : "",
      license_holder_relationship:
        detail.licenseHolderType === "other"
          ? detail.licenseHolderRelationship?.trim() || ""
          : "",
      license_holder_consent_url:
        detail.licenseHolderType === "other" ? detail.consentLetterUrl?.trim() || "" : "",
    };
  });
}

/** Dynamic document checklist based on selected services and their details. */
function buildDocumentChecklist(selectedServices, serviceDetails) {
  const items = [];

  items.push({
    id: "irdai-cert",
    label: "IRDAI Registration Certificate",
    hint: "Your IRDAI licence / agent code certificate issued by IRDAI or your insurer.",
    required: true,
    alreadyUploaded: false,
  });

  const uniqueCompanies = [
    ...new Set(
      selectedServices
        .map((id) => serviceDetails[id]?.company?.trim())
        .filter(Boolean),
    ),
  ];

  for (const company of uniqueCompanies) {
    items.push({
      id: `appt-${company}`,
      label: `Appointment / Authorization Letter — ${company}`,
      hint: `Letter from ${company} confirming your appointment or agency agreement.`,
      required: true,
      alreadyUploaded: false,
    });
  }

  const hasOtherHolder = selectedServices.some(
    (id) => serviceDetails[id]?.licenseHolderType === "other",
  );
  if (hasOtherHolder) {
    items.push({
      id: "consent-note",
      label: "Consent Letter (Licence Holder)",
      hint: "Already uploaded per-service in Step 4 — no separate upload needed here.",
      required: false,
      alreadyUploaded: true,
    });
  }

  return items;
}

/* ─── Step-level titles and subtitles ─────────────────────── */

const STEP_TITLE = {
  industry: "1. Industry",
  category: "2. Service Category",
  services: "3. Select Services",
  details: "4. Service Details",
  documents: "5. Verification Documents",
  plan: "6. Choose Your Plan",
  handle: "7. Your Profile URL",
  review: "8. Review & Submit",
};

const STEP_SUBTITLE = {
  industry: "Select the industry you operate in",
  category: "Select the category that best describes your services",
  services: "Select all insurance services you are currently active in",
  details: "Add your professional details for each selected service",
  documents: "Upload documents so YVITY can verify your credentials",
  plan: "Free goes live instantly · Silver & Gold include YVITY service verification",
  handle: "Choose your unique YVITY handle — this becomes your personal subdomain",
  review: "Review your information carefully before submitting",
};

/* ─── Main component ─────────────────────────────────────── */

export default function SetupMyProfileFlow({ isOpen = true, onClose, onComplete }) {
  const router = useRouter();
  const { user } = useAuth();

  const [stepIndex, setStepIndex] = useState(0);
  const [roles, setRoles] = useState([]);
  const [rolesError, setRolesError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [freePlanConfirm, setFreePlanConfirm] = useState(false);

  const [industryId, setIndustryId] = useState(DEFAULT_INDUSTRY_ID);
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORY_ID);
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceDetails, setServiceDetails] = useState({});
  const [expandedServiceId, setExpandedServiceId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [planPriceOverrides, setPlanPriceOverrides] = useState(null);
  const [stepAlert, setStepAlert] = useState("");
  const [invalidFields, setInvalidFields] = useState({});
  const stepAlertRef = useRef(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [paidPlanId, setPaidPlanId] = useState(null);
  const [razorpayPaymentId, setRazorpayPaymentId] = useState(null);
  const [chosenHandle, setChosenHandle] = useState(null);

  const { payForPlan } = useRazorpayCheckout();

  const totalSteps = SETUP_PROFILE_STEPS.length;
  const currentStep = SETUP_PROFILE_STEPS[stepIndex];

  const serviceOptions = useMemo(
    () => getServicesForCategory(categoryId),
    [categoryId],
  );

  const getServiceMeta = useCallback(
    (serviceId) => serviceOptions.find((item) => item.id === serviceId),
    [serviceOptions],
  );

  const hasEnteredData = selectedServices.length > 0 || documents.length > 0;

  /* ── Admin plan prices — load once so plan cards show live prices ── */
  useEffect(() => {
    fetch("/api/advisor/subscription/plan-prices")
      .then((res) => res.json())
      .then((result) => {
        if (result?.success && Array.isArray(result.data)) {
          setPlanPriceOverrides(result.data);
        }
      })
      .catch(() => {});
  }, []);

  /* ── Roles fetch — checked early so errors surface at review ── */
  useEffect(() => {
    fetch("/api/customer/roles")
      .then((res) => res.json())
      .then((result) => {
        if (result?.success && Array.isArray(result.data)) {
          setRoles(result.data);
          setRolesError(false);
        } else {
          setRolesError(true);
        }
      })
      .catch(() => setRolesError(true));
  }, []);

  /* ── Auto-expand first service accordion ── */
  useEffect(() => {
    if (!selectedServices.length) {
      setExpandedServiceId("");
      return;
    }
    if (!expandedServiceId || !selectedServices.includes(expandedServiceId)) {
      setExpandedServiceId(selectedServices[0]);
    }
  }, [selectedServices, expandedServiceId]);

  /* ── Clear validation on step change ── */
  useEffect(() => {
    setStepAlert("");
    setInvalidFields({});
  }, [stepIndex]);

  /* ─── Service state helpers ─────────────────────────────── */

  const syncServiceDetails = (nextSelected) => {
    setServiceDetails((prev) => {
      const next = { ...prev };
      nextSelected.forEach((id) => {
        if (!next[id]) next[id] = createEmptyServiceDetail();
      });
      Object.keys(next).forEach((id) => {
        if (!nextSelected.includes(id)) delete next[id];
      });
      return next;
    });
  };

  const toggleService = (serviceId) => {
    clearFieldInvalid("services");
    setSelectedServices((prev) => {
      const next = prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId];
      syncServiceDetails(next);
      return next;
    });
  };

  const removeServiceChip = (serviceId) => {
    setSelectedServices((prev) => {
      const next = prev.filter((id) => id !== serviceId);
      syncServiceDetails(next);
      return next;
    });
  };

  const updateServiceDetail = (serviceId, patch) => {
    Object.keys(patch).forEach((field) => clearFieldInvalid(fieldKey(serviceId, field)));
    setServiceDetails((prev) => ({
      ...prev,
      [serviceId]: { ...(prev[serviceId] ?? createEmptyServiceDetail()), ...patch },
    }));
  };

  /* ─── Consent letter — uploaded immediately on file select ── */

  const handleConsentLetterSelected = async (serviceId, file) => {
    if (!file) return;
    if (file.size > MAX_DOCUMENT_BYTES) {
      toast.error("Consent letter must be 5 MB or smaller");
      return;
    }

    updateServiceDetail(serviceId, {
      consentLetterFile: file,
      consentLetterName: file.name,
      consentLetterUrl: "",
      consentUploading: true,
    });
    clearFieldInvalid(fieldKey(serviceId, "consentLetter"));

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/advisor/verification-documents", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok || !result?.success) throw new Error(result?.message || "Upload failed");

      updateServiceDetail(serviceId, {
        consentLetterUrl: result.url,
        consentLetterName: file.name,
        consentLetterFile: null,
        consentUploading: false,
      });
    } catch (err) {
      toast.error(err?.message || "Failed to upload consent letter — please try again");
      updateServiceDetail(serviceId, {
        consentLetterFile: null,
        consentLetterName: "",
        consentLetterUrl: "",
        consentUploading: false,
      });
    }
  };

  /* ─── Main documents ─────────────────────────────────────── */

  const handleFilesSelected = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;

    const accepted = [];
    for (const file of incoming) {
      if (file.size > MAX_DOCUMENT_BYTES) {
        toast.error(`${file.name} must be 5 MB or smaller`);
        continue;
      }
      accepted.push(file);
    }
    if (!accepted.length) return;

    clearFieldInvalid("documents");
    setStepAlert("");

    setDocuments((prev) => [
      ...prev,
      ...accepted.map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        url: "",
      })),
    ]);
  };

  const removeDocument = (id) => setDocuments((prev) => prev.filter((doc) => doc.id !== id));

  /* ─── Validation ─────────────────────────────────────────── */

  const clearFieldInvalid = (key) => {
    setInvalidFields((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const clearValidation = () => {
    setStepAlert("");
    setInvalidFields({});
  };

  const invalidClass = (key) =>
    invalidFields[key] ? "border-red-400 ring-1 ring-red-200/80" : "";

  const validateStep = () => {
    const nextInvalid = {};
    let message = "";

    switch (currentStep.id) {
      case "industry":
      case "category":
        // single-option steps always pass
        break;

      case "services":
        if (!selectedServices.length) {
          nextInvalid.services = true;
          message = "Select at least one service to continue.";
        }
        break;

      case "details": {
        for (const serviceId of selectedServices) {
          const detail = serviceDetails[serviceId] ?? createEmptyServiceDetail();
          const label = getServiceLabel(categoryId, serviceId);
          const mark = (field, text) => {
            nextInvalid[fieldKey(serviceId, field)] = true;
            if (!message) message = `${text} (${label})`;
          };

          // Field order matches render order:
          if (!detail.company?.trim()) {
            mark("company", "Add company name");
          } else if (!detail.licenseNumber?.trim()) {
            mark("licenseNumber", "Add IRDAI licence number");
          } else if (detail.licenseHolderType === "other") {
            if (!detail.licenseHolderName?.trim()) {
              mark("licenseHolderName", "Add licence holder name");
            } else if (!detail.licenseHolderRelationship?.trim()) {
              mark("licenseHolderRelationship", "Select relationship");
            } else if (!detail.consentLetterUrl?.trim() && !detail.consentLetterFile) {
              mark("consentLetter", "Upload the signed consent letter");
            } else if (detail.consentUploading) {
              mark("consentLetter", "Wait for consent letter to finish uploading");
            } else if (!detail.declarationAccepted) {
              nextInvalid[fieldKey(serviceId, "declaration")] = true;
              if (!message) message = `Confirm the licence holder declaration (${label})`;
            }
          }

          if (!message) {
            if (!detail.designation?.trim()) mark("designation", "Add your designation");
            else if (!detail.professionalCapacity?.trim()) {
              mark("professionalCapacity", "Select your account type");
            } else if (!detail.startDate) {
              mark("startDate", "Add your service start date");
            }
          }

          if (message) break; // stop at first service with an error
        }

        if (message) {
          const firstService = Object.keys(nextInvalid)
            .find((key) => key.includes("."))
            ?.split(".")[0];
          if (firstService) setExpandedServiceId(firstService);
        }
        break;
      }

      case "documents":
        if (!documents.length) {
          nextInvalid.documents = true;
          message = "Upload at least one verification document.";
        }
        break;

      case "plan":
        if (!selectedPlan) {
          nextInvalid.plan = true;
          message = "Please select a membership plan.";
        }
        break;

      case "handle":
        // Optional — advisor can skip and set their URL later from the Profile section
        break;

      default:
        break;
    }

    if (message) {
      setStepAlert(message);
      setInvalidFields(nextInvalid);
      scrollToFirstInvalid(nextInvalid);
      return false;
    }

    clearValidation();
    return true;
  };

  /* ─── Navigation ─────────────────────────────────────────── */

  const goNext = () => {
    if (!validateStep()) return;
    // Free plan: confirm before advancing from plan step
    if (currentStep.id === "plan" && selectedPlan === "free" && !freePlanConfirm) {
      setFreePlanConfirm(true);
      return;
    }
    setFreePlanConfirm(false);
    clearValidation();
    setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
  };

  const goBack = () => {
    setFreePlanConfirm(false);
    clearValidation();
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const handleRequestClose = () => {
    if (hasEnteredData) {
      setShowCloseConfirm(true);
    } else {
      onClose?.();
    }
  };

  /* ─── Consent form PDF download ─────────────────────────── */

  const handleDownloadConsentForm = async (serviceId) => {
    const detail = serviceDetails[serviceId] ?? createEmptyServiceDetail();
    const serviceLabel = getServiceLabel(categoryId, serviceId);
    const profileHolderName = user?.name?.trim() || "";
    const profileHolderMobile = user?.phone?.trim() || user?.mobile?.trim() || "";
    const place = [user?.city?.trim(), user?.state?.trim()].filter(Boolean).join(", ");

    // Soft warning for missing mobile — don't hard-block
    if (!profileHolderMobile) {
      toast.warning(
        "Your registered mobile number is missing — the mobile field will be left blank on the form. You can write it in by hand.",
        { duration: 6000 },
      );
    }

    if (!detail.licenseHolderName?.trim()) {
      toast.error("Enter the licence holder name before downloading");
      return;
    }
    if (!detail.licenseHolderRelationship?.trim()) {
      toast.error("Select the relationship before downloading");
      return;
    }
    if (!detail.company?.trim()) {
      toast.error("Enter the company name before downloading");
      return;
    }
    if (!profileHolderName) {
      toast.error("Complete your YVITY registration with your full name first");
      return;
    }

    try {
      await downloadLicenseHolderConsentPdf({
        licenceHolderName: detail.licenseHolderName.trim(),
        licenceNumber: detail.licenseNumber?.trim() || "",
        companyName: detail.company.trim(),
        serviceLabel,
        relationship: detail.licenseHolderRelationship,
        profileHolderName,
        profileHolderMobile,
        place: place || undefined,
      });
      toast.success("Consent form downloaded — get both signatures, then upload it");
    } catch {
      toast.error("Could not generate the consent form. Please try again.");
    }
  };

  /* ─── Documents upload (main step) ──────────────────────── */

  const uploadDocuments = async () => {
    const uploaded = [];
    for (const doc of documents) {
      if (doc.url) {
        uploaded.push(doc);
        continue;
      }
      const formData = new FormData();
      formData.append("file", doc.file);
      const res = await fetch("/api/advisor/verification-documents", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok || !result?.success) {
        throw new Error(result?.message || `Failed to upload ${doc.name}`);
      }
      uploaded.push({ ...doc, url: result.url });
    }
    setDocuments(uploaded);
    return uploaded;
  };

  /* ─── Plan helpers ───────────────────────────────────────── */

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    setFreePlanConfirm(false);
    if (planId === "free" || planId !== paidPlanId) {
      setPaymentDone(false);
      setPaidPlanId(null);
      setRazorpayPaymentId(null);
    }
  };

  /* ─── Submit ─────────────────────────────────────────────── */

  const handleSubmit = async () => {
    if (submitting) return;

    if (rolesError) {
      toast.error("Cannot submit — advisor roles failed to load. Refresh and try again.");
      return;
    }

    const advisorRoleId = resolveAdvisorRoleId(roles, selectedServices[0]);
    if (!advisorRoleId) {
      toast.error("Advisor roles are not available. Please refresh and try again.");
      return;
    }

    const isPaidPlan = selectedPlan === "silver" || selectedPlan === "gold";

    try {
      setSubmitting(true);

      let paymentId = razorpayPaymentId;
      if (isPaidPlan && !paymentId) {
        toast.loading("Opening Razorpay checkout…", { id: "rzp-pay" });
        paymentId = await payForPlan(selectedPlan);
        toast.dismiss("rzp-pay");
        setPaymentDone(true);
        setPaidPlanId(selectedPlan);
        setRazorpayPaymentId(paymentId);
        toast.success("Payment successful");
      }

      setUploadingDocs(true);
      const uploadedDocs = await uploadDocuments();
      setUploadingDocs(false);

      const services = buildServicesPayload({
        categoryId,
        selectedServices,
        serviceDetails,
        getServiceMeta,
      });

      const industryLabel = getIndustryLabel(industryId);
      const categoryLabel = getCategoryLabel(industryId, categoryId);
      const bio = `Verified ${categoryLabel} professional in ${industryLabel} on YVITY. Committed to transparent advice and client-first service.`;

      const primaryLicense = serviceDetails[selectedServices[0]]?.licenseNumber?.trim() || "";
      const documentUrls = uploadedDocs.map((doc) => doc.url).filter(Boolean);

      const res = await fetch("/api/customer/setprofile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advisor_role_id: advisorRoleId,
          services,
          bio,
          designation: services[0]?.designation || "Insurance Advisor",
          certificate_url: documentUrls[0] || "",
          document_urls: documentUrls,
          subscription_plan: selectedPlan,
          razorpay_payment_id: isPaidPlan ? paymentId : undefined,
          profile_slug: chosenHandle || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok || result?.success === false) {
        throw new Error(result?.message || result?.error || "Failed to submit profile");
      }

      // Patch IRDAI details — flexible, strips only surrounding whitespace
      if (primaryLicense && uploadedDocs[0]?.url) {
        await fetch("/api/customer/setprofile/irdai", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            license_number: primaryLicense,
            certificate_url: uploadedDocs[0].url,
          }),
        }).catch(() => {});
      }

      toast.success(
        isPaidPlan ? "Profile submitted for verification" : "Your profile is live on YVITY",
      );
      onComplete?.();
      onClose?.();
      router.replace("/dashboard/my-space?setup=submitted");
    } catch (error) {
      toast.error(error?.message || "Submission failed");
    } finally {
      setSubmitting(false);
      setUploadingDocs(false);
    }
  };

  if (!isOpen) return null;

  /* ─── Step content ───────────────────────────────────────── */

  const stepTitle = STEP_TITLE[currentStep.id] ?? currentStep.label;
  const stepSubtitle = STEP_SUBTITLE[currentStep.id] ?? "";

  /* Close confirmation overlay */
  if (showCloseConfirm) {
    const discardContent = (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <AlertTriangle className="mb-3 h-10 w-10 text-[#F59E0B]" />
        <h3 className="font-cormorant text-2xl font-bold text-[#0A4A4A]">Discard progress?</h3>
        <p className="mx-auto mt-2 max-w-xs font-poppins text-sm leading-relaxed text-[#6B7280]">
          All details you&apos;ve entered will be lost. You&apos;ll need to start the setup again.
        </p>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-3">
          <button
            type="button"
            onClick={() => setShowCloseConfirm(false)}
            className="w-full rounded-xl bg-gradient-to-r from-[#0A4A4A] to-[#0D6060] py-3 font-poppins text-sm font-semibold text-[#F59E0B]"
          >
            Continue setup
          </button>
          <button
            type="button"
            onClick={() => { setShowCloseConfirm(false); onClose?.(); }}
            className="w-full rounded-xl border border-[#E4E2DB] py-3 font-poppins text-sm font-semibold text-[#6B7280] hover:border-red-300 hover:text-red-600"
          >
            Yes, discard & close
          </button>
        </div>
      </div>
    );

    return (
      <SetupProfileLuxuryModal
        isOpen
        onClose={() => setShowCloseConfirm(false)}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        title="Are you sure?"
        subtitle="You have unsaved setup progress"
        footer={null}
      >
        {discardContent}
      </SetupProfileLuxuryModal>
    );
  }

  /* Free plan confirmation overlay */
  if (freePlanConfirm) {
    const confirmContent = (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0FDF4]">
          <CheckCircle2 className="h-8 w-8 text-[#16A34A]" />
        </div>
        <h3 className="font-cormorant text-2xl font-bold text-[#0A4A4A]">
          Go live on the Free plan?
        </h3>
        <p className="mx-auto mt-2 max-w-xs font-poppins text-sm leading-relaxed text-[#6B7280]">
          Your profile will go live immediately after submit. Your identity is verified, but your
          services will <span className="font-semibold">not</span> carry the YVITY verified badge.
          You can upgrade to Silver or Gold at any time from My Space.
        </p>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              setFreePlanConfirm(false);
              clearValidation();
              setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
            }}
            className="w-full rounded-xl bg-gradient-to-r from-[#0A4A4A] to-[#0D6060] py-3 font-poppins text-sm font-semibold text-[#F59E0B]"
          >
            Yes, go live on Free
          </button>
          <button
            type="button"
            onClick={() => setFreePlanConfirm(false)}
            className="w-full rounded-xl border border-[#E4E2DB] py-3 font-poppins text-sm font-semibold text-[#6B7280]"
          >
            Back — choose a different plan
          </button>
        </div>
      </div>
    );

    return (
      <SetupProfileLuxuryModal
        isOpen
        onClose={handleRequestClose}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        title="Confirm Free Plan"
        subtitle="Your services won't be YVITY-verified on the Free plan"
        footer={null}
      >
        {confirmContent}
      </SetupProfileLuxuryModal>
    );
  }

  /* ── Step 1: Industry ── */
  const industryContent = (
    <div className="space-y-3">
      {ONBOARDING_INDUSTRIES.map((item) => {
        const Icon = item.icon;
        const selected = industryId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setIndustryId(item.id)}
            className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
              selected
                ? "border-[#0A4A4A] bg-[#F0FAFA] shadow-[0_0_0_1px_rgba(10,74,74,0.12)]"
                : "border-[#E4E2DB] bg-white hover:border-[#0A4A4A]/30"
            }`}
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-[#0A4A4A] text-[#F59E0B]" : "bg-[#F8F6F1] text-[#0A4A4A]"}`}
            >
              <Icon size={22} strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-poppins text-sm font-semibold text-[#0A4A4A]">{item.label}</p>
              <p className="mt-0.5 font-poppins text-xs text-[#6B7280]">
                Banking, Financial Services &amp; Insurance
              </p>
            </div>
            {selected ? (
              <CheckCircle2 size={20} className="shrink-0 text-[#0A4A4A]" />
            ) : null}
          </button>
        );
      })}
      <InfoNotice>More industries will be added as YVITY expands.</InfoNotice>
    </div>
  );

  /* ── Step 2: Category ── */
  const categories = ONBOARDING_CATEGORIES[industryId] ?? [];
  const categoryContent = (
    <div className="space-y-3">
      {categories.map((item) => {
        const Icon = item.icon;
        const selected = categoryId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setCategoryId(item.id);
              setSelectedServices([]);
              setServiceDetails({});
            }}
            className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
              selected
                ? "border-[#0A4A4A] bg-[#F0FAFA] shadow-[0_0_0_1px_rgba(10,74,74,0.12)]"
                : "border-[#E4E2DB] bg-white hover:border-[#0A4A4A]/30"
            }`}
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-[#0A4A4A] text-[#F59E0B]" : "bg-[#F8F6F1] text-[#0A4A4A]"}`}
            >
              <Icon size={22} strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-poppins text-sm font-semibold text-[#0A4A4A]">{item.label}</p>
            </div>
            {selected ? (
              <CheckCircle2 size={20} className="shrink-0 text-[#0A4A4A]" />
            ) : null}
          </button>
        );
      })}
      <InfoNotice>More categories — e.g. Mutual Funds, Loans — will be added soon.</InfoNotice>
    </div>
  );

  /* ── Step 3: Services ── */
  const servicesContent = (
    <div className="space-y-4">
      <div id="field-services" className={invalidFields.services ? "rounded-xl ring-1 ring-red-200/80 p-1" : ""}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <label className={labelClass}>
            Services <span className="text-[#EF4444]">*</span>
          </label>
          {selectedServices.length > 0 ? (
            <span className="rounded-full bg-[#0A4A4A] px-2.5 py-0.5 font-poppins text-[10px] font-bold text-[#F59E0B]">
              {selectedServices.length} selected
            </span>
          ) : null}
        </div>
        <div className="setup-service-pills -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-2.5 sm:overflow-visible sm:px-0 sm:pb-0">
          {serviceOptions.map((item) => {
            const Icon = item.icon;
            return (
              <ServiceSelectChip
                key={item.id}
                label={item.label}
                icon={Icon}
                selected={selectedServices.includes(item.id)}
                onClick={() => toggleService(item.id)}
              />
            );
          })}
        </div>
        {selectedServices.length === 0 ? (
          <p className="mt-2 font-poppins text-xs text-[#94A3B8]">
            Tap one or more services to continue.
          </p>
        ) : null}
      </div>
      <InfoNotice>
        Client counts, sum insured, claims, and claim ratio can be added later from{" "}
        <span className="font-semibold">Edit Service</span> in your workspace.
      </InfoNotice>
    </div>
  );

  /* ── Step 4: Service Details ── */
  const detailsContent = (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {selectedServices.map((serviceId) => (
          <LuxuryChip
            key={serviceId}
            label={getServiceLabel(categoryId, serviceId)}
            onRemove={() => removeServiceChip(serviceId)}
          />
        ))}
      </div>

      <div className="space-y-3">
        {selectedServices.map((serviceId) => {
          const label = getServiceLabel(categoryId, serviceId);
          const detail = serviceDetails[serviceId] ?? createEmptyServiceDetail();
          const expanded = expandedServiceId === serviceId;

          return (
            <AccordionSection
              key={serviceId}
              title={`${label} Details`}
              expanded={expanded}
              onToggle={() => setExpandedServiceId(expanded ? "" : serviceId)}
            >
              {/* Company Name */}
              <div>
                <label className={labelClass} htmlFor={`field-${fieldKey(serviceId, "company")}`}>
                  Company name <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  id={`field-${fieldKey(serviceId, "company")}`}
                  type="text"
                  value={detail.company}
                  onChange={(e) => updateServiceDetail(serviceId, { company: e.target.value })}
                  placeholder="e.g. LIC of India, HDFC Life"
                  className={`${fieldClass} ${invalidClass(fieldKey(serviceId, "company"))}`}
                />
              </div>

              {/* IRDAI License Number */}
              <div>
                <label className={labelClass} htmlFor={`field-${fieldKey(serviceId, "licenseNumber")}`}>
                  IRDAI licence / agent code <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  id={`field-${fieldKey(serviceId, "licenseNumber")}`}
                  type="text"
                  value={detail.licenseNumber}
                  onChange={(e) => updateServiceDetail(serviceId, { licenseNumber: e.target.value })}
                  placeholder="e.g. 1234567 or AB123456"
                  className={`${fieldClass} ${invalidClass(fieldKey(serviceId, "licenseNumber"))}`}
                />
              </div>

              {/* Licence Holder */}
              <div>
                <label className={labelClass}>
                  Licence holder <span className="text-[#EF4444]">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateServiceDetail(serviceId, {
                        licenseHolderType: "self",
                        licenseHolderName: "",
                        licenseHolderRelationship: "",
                        consentLetterUrl: "",
                        consentLetterName: "",
                        consentLetterFile: null,
                        declarationAccepted: false,
                      })
                    }
                    className={`rounded-xl border px-3 py-2.5 text-left font-poppins text-xs font-semibold ${
                      detail.licenseHolderType !== "other"
                        ? "border-[#0A4A4A] bg-[#F0FAFA] text-[#0A4A4A]"
                        : "border-[#E2E8F0] text-[#64748B]"
                    }`}
                  >
                    Self — licence in my name
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateServiceDetail(serviceId, { licenseHolderType: "other" })
                    }
                    className={`rounded-xl border px-3 py-2.5 text-left font-poppins text-xs font-semibold ${
                      detail.licenseHolderType === "other"
                        ? "border-[#0A4A4A] bg-[#F0FAFA] text-[#0A4A4A]"
                        : "border-[#E2E8F0] text-[#64748B]"
                    }`}
                  >
                    Other — e.g. spouse, family member, or friend
                  </button>
                </div>
                <p className="mt-1 font-poppins text-[11px] text-[#94A3B8]">
                  Choose Self when the IRDAI licence is in your name. Choose Other when you
                  represent someone else&apos;s appointment.
                </p>
              </div>

              {/* Other licence holder fields */}
              {detail.licenseHolderType === "other" ? (
                <>
                  <div>
                    <label className={labelClass} htmlFor={`field-${fieldKey(serviceId, "licenseHolderName")}`}>
                      Licence holder name <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      id={`field-${fieldKey(serviceId, "licenseHolderName")}`}
                      type="text"
                      value={detail.licenseHolderName}
                      onChange={(e) =>
                        updateServiceDetail(serviceId, { licenseHolderName: e.target.value })
                      }
                      placeholder="As printed on the IRDAI certificate"
                      className={`${fieldClass} ${invalidClass(fieldKey(serviceId, "licenseHolderName"))}`}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor={`field-${fieldKey(serviceId, "licenseHolderRelationship")}`}>
                      Relationship <span className="text-[#EF4444]">*</span>
                    </label>
                    <select
                      id={`field-${fieldKey(serviceId, "licenseHolderRelationship")}`}
                      value={detail.licenseHolderRelationship}
                      onChange={(e) =>
                        updateServiceDetail(serviceId, {
                          licenseHolderRelationship: e.target.value,
                        })
                      }
                      className={`${selectClass} ${invalidClass(fieldKey(serviceId, "licenseHolderRelationship"))}`}
                    >
                      <option value="">Select relationship</option>
                      {[...LICENSE_HOLDER_RELATIONSHIPS]
                        .sort((a, b) => a.label.localeCompare(b.label))
                        .map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Download consent form */}
                  <div className="rounded-2xl border border-[#0A4A4A]/15 bg-[#F8FAFC] px-4 py-3.5">
                    <p className="font-poppins text-xs font-semibold text-[#0F172A]">
                      Step 1 — Download the standard consent form
                    </p>
                    <p className="mt-1 font-poppins text-[11px] leading-relaxed text-[#64748B]">
                      The form will be pre-filled with the licence holder name, relationship
                      and company you entered above. Both the{" "}
                      <span className="font-semibold text-[#0F172A]">licence holder</span> and{" "}
                      <span className="font-semibold text-[#0F172A]">you</span> must sign it.
                      Relationship on the form:{" "}
                      <span className="font-semibold text-[#0A4A4A]">
                        {detail.licenseHolderRelationship
                          ? relationshipLabel(detail.licenseHolderRelationship)
                          : "— select above"}
                      </span>
                      .
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDownloadConsentForm(serviceId)}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#0A4A4A] bg-white px-3.5 py-2 font-poppins text-xs font-semibold text-[#0A4A4A] transition hover:bg-[#F0FAFA]"
                    >
                      <Download size={15} aria-hidden />
                      Download consent form (PDF)
                    </button>
                  </div>

                  {/* Upload signed consent letter */}
                  <div id={`field-${fieldKey(serviceId, "consentLetter")}`}>
                    <label className={labelClass}>
                      Step 2 — Upload signed consent letter{" "}
                      <span className="text-[#EF4444]">*</span>
                    </label>
                    {detail.consentUploading ? (
                      <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-3 py-3">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0A4A4A] border-t-transparent" />
                        <span className="font-poppins text-xs text-[#64748B]">
                          Uploading consent letter…
                        </span>
                      </div>
                    ) : detail.consentLetterUrl ? (
                      <div className="flex items-center gap-3 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2.5">
                        <CheckCircle2 size={18} className="shrink-0 text-[#16A34A]" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-poppins text-xs font-semibold text-[#0F172A]">
                            {detail.consentLetterName || "Consent letter uploaded"}
                          </p>
                          <p className="font-poppins text-[11px] text-[#16A34A]">
                            Uploaded ✓
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateServiceDetail(serviceId, {
                              consentLetterUrl: "",
                              consentLetterName: "",
                              consentLetterFile: null,
                            })
                          }
                          className="rounded-lg p-1.5 text-[#64748B] transition hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                          aria-label="Remove consent letter"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ) : (
                      <label
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-white/70 px-4 py-6 transition hover:border-[#F59E0B]/40 hover:bg-[#FFFBF2] ${
                          invalidFields[fieldKey(serviceId, "consentLetter")]
                            ? "border-red-300 bg-red-50/40"
                            : "border-[#0A4A4A]/20"
                        }`}
                      >
                        <CloudUpload className="mb-2 h-7 w-7 text-[#64748B]" />
                        <span className="font-poppins text-xs font-semibold text-[#0F172A]">
                          Upload signed consent letter
                        </span>
                        <span className="mt-1 text-center font-poppins text-[11px] text-[#64748B]">
                          JPG, PNG, or PDF — max 5 MB
                        </span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            handleConsentLetterSelected(serviceId, file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}
                    <p className="mt-1 font-poppins text-[11px] text-[#94A3B8]">
                      {LICENSE_HOLDER_CONSENT_HINT}
                    </p>
                  </div>

                  {/* Per-service declaration */}
                  <label
                    id={`field-${fieldKey(serviceId, "declaration")}`}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3.5 ${
                      invalidFields[fieldKey(serviceId, "declaration")]
                        ? "border-red-300 bg-red-50/40"
                        : "border-[#E2E8F0] bg-[#FFFBF2]/80"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={detail.declarationAccepted}
                      onChange={(e) =>
                        updateServiceDetail(serviceId, {
                          declarationAccepted: e.target.checked,
                        })
                      }
                      className="mt-0.5 size-4 shrink-0 rounded border-[#CBD5E1] text-[#0A4A4A] focus:ring-[#F59E0B]"
                    />
                    <span className="font-poppins text-xs leading-relaxed text-[#475569]">
                      For <span className="font-semibold text-[#0A4A4A]">{label}</span> —{" "}
                      {LICENSE_HOLDER_DECLARATION}
                    </span>
                  </label>
                </>
              ) : null}

              {/* Designation */}
              <div>
                <label className={labelClass} htmlFor={`field-${fieldKey(serviceId, "designation")}`}>
                  Designation <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  id={`field-${fieldKey(serviceId, "designation")}`}
                  type="text"
                  value={detail.designation}
                  onChange={(e) =>
                    updateServiceDetail(serviceId, { designation: e.target.value })
                  }
                  placeholder="e.g. Senior LIC Advisor"
                  className={`${fieldClass} ${invalidClass(fieldKey(serviceId, "designation"))}`}
                />
              </div>

              {/* Capacity */}
              <div>
                <label className={labelClass}>
                  Account type <span className="text-[#EF4444]">*</span>
                </label>
                <ServiceAccountTypePicker
                  variant="setup"
                  value={detail.professionalCapacity || "individual_agent"}
                  onChange={(capacityId) =>
                    updateServiceDetail(serviceId, { professionalCapacity: capacityId })
                  }
                />
              </div>

              {/* Start Date */}
              <div>
                <label className={labelClass} htmlFor={`field-${fieldKey(serviceId, "startDate")}`}>
                  Service start date <span className="text-[#EF4444]">*</span>
                </label>
                <div className="relative">
                  <input
                    id={`field-${fieldKey(serviceId, "startDate")}`}
                    type="date"
                    value={detail.startDate}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) =>
                      updateServiceDetail(serviceId, { startDate: e.target.value })
                    }
                    className={`${fieldClass} pr-10 ${invalidClass(fieldKey(serviceId, "startDate"))}`}
                  />
                  <Calendar
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                  />
                </div>
                {detail.startDate ? (
                  <p className="mt-1.5 font-poppins text-[11px] font-semibold text-[#0A4A4A]">
                    Experience:{" "}
                    {formatExperienceFromStart(detail.startDate) ??
                      `${computeYearsSinceStartDate(detail.startDate) ?? 0} years`}
                  </p>
                ) : null}
                <p className="mt-1 font-poppins text-[11px] text-[#94A3B8]">
                  Only active services are listed during onboarding.
                </p>
              </div>
            </AccordionSection>
          );
        })}
      </div>
    </div>
  );

  /* ── Step 5: Documents ── */
  const docChecklist = buildDocumentChecklist(selectedServices, serviceDetails);
  const documentsContent = (
    <div>
      {/* Smart guidance checklist */}
      <div className="mb-5 rounded-2xl border border-[#0A4A4A]/12 bg-[#F0FAFA]/80 p-4">
        <p className="mb-3 font-poppins text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0A4A4A]/60">
          What to upload
        </p>
        <ul className="space-y-3">
          {docChecklist.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  item.alreadyUploaded
                    ? "bg-[#DCFCE7] text-[#16A34A]"
                    : "bg-[#0A4A4A] text-[#F59E0B]"
                }`}
              >
                {item.alreadyUploaded ? (
                  <CheckCircle2 size={12} />
                ) : (
                  <span className="font-poppins text-[9px] font-bold">
                    {item.required ? "!" : "i"}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-poppins text-xs font-semibold text-[#0F172A]">{item.label}</p>
                <p className="mt-0.5 font-poppins text-[11px] leading-snug text-[#64748B]">
                  {item.hint}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Upload zone */}
      <label
        id="field-documents"
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white/70 px-4 py-10 transition hover:border-[#F59E0B]/40 hover:bg-[#FFFBF2] ${
          invalidFields.documents ? "border-red-300 bg-red-50/40" : "border-[#0A4A4A]/20"
        }`}
      >
        <CloudUpload className="mb-2 h-8 w-8 text-[#64748B]" />
        <span className="font-poppins text-sm font-semibold text-[#0F172A]">Choose Files</span>
        <span className="mt-1 font-poppins text-xs text-[#64748B]">
          JPG, PNG, PDF — max 5 MB each
        </span>
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
          className="sr-only"
          onChange={(e) => {
            handleFilesSelected(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {documents.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#0A4A4A]">
                <FileText size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-poppins text-sm font-semibold text-[#0F172A]">
                  {doc.name}
                </p>
                <p className="font-poppins text-xs text-[#64748B]">{formatFileSize(doc.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeDocument(doc.id)}
                className="text-[#EF4444] hover:text-[#DC2626]"
                aria-label={`Remove ${doc.name}`}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#F8FAFC] px-3 py-2.5 font-poppins text-xs text-[#64748B]">
        <Lock size={14} className="mt-0.5 shrink-0 text-[#0A4A4A]" />
        Your documents are encrypted and used only for identity verification.
      </div>
    </div>
  );

  /* ── Step 6: Plan ── */
  const planContent = (
    <SetupPlanStep
      selectedPlan={selectedPlan}
      onSelectPlan={handlePlanSelect}
      paymentDone={paymentDone}
      paidPlanId={paidPlanId}
      planPriceOverrides={planPriceOverrides}
    />
  );

  /* ── Step 7: Review ── */
  const reviewContent = (
    <div>
      {rolesError ? (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 font-poppins text-xs text-red-700">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          <span>
            Failed to load advisor roles. Please close and reopen the setup, or refresh the page.
            Submission is disabled until this resolves.
          </span>
        </div>
      ) : null}

      <dl className="divide-y divide-[#E2E8F0] overflow-hidden rounded-xl border border-[#E2E8F0]">
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="font-poppins text-sm text-[#64748B]">Industry</dt>
          <dd className="font-poppins text-sm font-semibold text-[#0F172A]">
            {getIndustryLabel(industryId)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="font-poppins text-sm text-[#64748B]">Category</dt>
          <dd className="font-poppins text-sm font-semibold text-[#0F172A]">
            {getCategoryLabel(industryId, categoryId)}
          </dd>
        </div>

        {/* Per-service detail rows */}
        {selectedServices.map((serviceId) => {
          const detail = serviceDetails[serviceId] ?? createEmptyServiceDetail();
          const label = getServiceLabel(categoryId, serviceId);
          return (
            <div key={serviceId} className="px-4 py-3">
              <p className="mb-2 font-poppins text-[11px] font-bold uppercase tracking-[0.1em] text-[#F59E0B]">
                {label}
              </p>
              <div className="space-y-1">
                {[
                  ["Company", detail.company],
                  ["IRDAI Licence", detail.licenseNumber],
                  ["Designation", detail.designation],
                  [
                    "Licence Holder",
                    detail.licenseHolderType === "other"
                      ? `${detail.licenseHolderName} (${relationshipLabel(detail.licenseHolderRelationship)})`
                      : "Self",
                  ],
                  ["Start Date", detail.startDate],
                ].map(([key, value]) =>
                  value ? (
                    <div key={key} className="flex justify-between gap-4">
                      <span className="font-poppins text-xs text-[#64748B]">{key}</span>
                      <span className="font-poppins text-xs font-semibold text-[#0F172A]">
                        {value}
                      </span>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          );
        })}

        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="font-poppins text-sm text-[#64748B]">Documents</dt>
          <dd className="font-poppins text-sm font-semibold text-[#0F172A]">
            {documents.length} file{documents.length === 1 ? "" : "s"}
          </dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="font-poppins text-sm text-[#64748B]">Plan</dt>
          <dd className="font-poppins text-sm font-semibold uppercase text-[#0F172A]">
            {selectedPlan}
            {paymentDone && (selectedPlan === "silver" || selectedPlan === "gold")
              ? " · paid"
              : ""}
          </dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="font-poppins text-sm text-[#64748B]">Status after submit</dt>
          <dd className="font-poppins text-sm font-bold text-[#16A34A]">
            {selectedPlan === "free" ? "Goes live immediately" : "Pending YVITY verification"}
          </dd>
        </div>
      </dl>

      <div
        className={`mt-4 rounded-xl border px-4 py-3 font-poppins text-xs leading-relaxed ${
          selectedPlan === "free"
            ? "border-[#BBF7D0]/80 bg-[#F0FDF4]/90 text-[#166534]"
            : "border-[#FDE68A]/80 bg-[#FFFBEB]/90 text-[#92400E]"
        }`}
      >
        {selectedPlan === "free"
          ? "Your profile will go live immediately. Identity is verified; services are not YVITY-verified on the Free plan."
          : "Payment via Razorpay is processed on submit (if not done yet). Our team verifies your profile — usually within 24–48 hours."}
      </div>
    </div>
  );

  /* ─── Compose step content ───────────────────────────────── */

  const stepContent = (
    <>
      {stepAlert ? (
        <div
          ref={stepAlertRef}
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 font-poppins text-xs leading-relaxed text-red-700"
        >
          {stepAlert}
        </div>
      ) : null}

      {currentStep.id === "industry" ? industryContent : null}
      {currentStep.id === "category" ? categoryContent : null}
      {currentStep.id === "services" ? servicesContent : null}
      {currentStep.id === "details" ? detailsContent : null}
      {currentStep.id === "documents" ? documentsContent : null}
      {currentStep.id === "plan" ? planContent : null}
      {currentStep.id === "handle" ? (
        <HandlePicker
          defaultHandle={handleFromName(user?.name || "")}
          onChange={setChosenHandle}
        />
      ) : null}
      {currentStep.id === "review" ? reviewContent : null}
    </>
  );

  /* ─── Footer ─────────────────────────────────────────────── */

  const isReview = currentStep.id === "review";

  const footer = (
    <>
      <SetupModalProgress stepIndex={stepIndex} totalSteps={totalSteps} />
      {isReview ? (
        <PrimaryContinueButton
          variant="gold"
          onClick={handleSubmit}
          loading={submitting}
          disabled={rolesError}
          label={
            submitting
              ? uploadingDocs
                ? "Uploading documents…"
                : selectedPlan === "silver" || selectedPlan === "gold"
                  ? paymentDone
                    ? "Submitting…"
                    : "Processing payment…"
                  : "Submitting…"
              : selectedPlan === "free"
                ? "Go live"
                : paymentDone
                  ? "Submit for verification"
                  : "Pay & submit"
          }
        />
      ) : currentStep.id === "handle" ? (
        <div className="flex flex-col gap-2 w-full">
          <PrimaryContinueButton
            onClick={goNext}
            label={chosenHandle ? "Save & Continue" : "Skip for now"}
          />
          {!chosenHandle && (
            <p className="text-center font-poppins text-[11px] text-[#9CA3AF] leading-snug">
              You can claim your personal URL later from the{" "}
              <span className="font-semibold text-[#6B7280]">Profile</span> section in My Space.
            </p>
          )}
        </div>
      ) : (
        <PrimaryContinueButton
          onClick={goNext}
          label={currentStep.id === "documents" ? "Choose plan" : "Continue"}
        />
      )}
    </>
  );

  return (
    <SetupProfileLuxuryModal
      isOpen={isOpen}
      onClose={handleRequestClose}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title={stepTitle}
      subtitle={stepSubtitle}
      onBack={stepIndex > 0 ? goBack : undefined}
      footer={footer}
    >
      {stepContent}
    </SetupProfileLuxuryModal>
  );
}

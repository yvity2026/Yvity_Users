"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, CloudUpload, Download, FileText, Lock, Trash2 } from "lucide-react";
import {
  createEmptyServiceDetail,
  DEFAULT_CATEGORY_ID,
  DEFAULT_INDUSTRY_ID,
  getCategoriesForIndustry,
  getCategoryLabel,
  getIndustryLabel,
  getServiceLabel,
  getServicesForCategory,
  ONBOARDING_INDUSTRIES,
  resolveAdvisorRoleId,
  SETUP_PROFILE_STEPS,
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

const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fieldKey(serviceId, field) {
  return `${serviceId}.${field}`;
}

function buildServicesPayload({
  categoryId,
  selectedServices,
  serviceDetails,
  getServiceMeta,
}) {
  return selectedServices.map((serviceId) => {
    const meta = getServiceMeta(serviceId);
    const detail = serviceDetails[serviceId] ?? createEmptyServiceDetail();
    const startYear = detail.startDate
      ? String(detail.startDate).slice(0, 4)
      : null;

    return {
      service: meta?.apiType || meta?.label || "General Insurance",
      company: detail.company?.trim() || "",
      license: detail.licenseNumber?.trim() || "",
      experience: startYear ? new Date().getFullYear() - Number(startYear) : null,
      designation: detail.designation?.trim() || "",
      fromYear: detail.startDate || null,
      toYear: detail.isActive ? null : detail.endDate || null,
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

export default function SetupMyProfileFlow({
  variant = "page",
  isOpen = true,
  onClose,
  onComplete,
}) {
  const router = useRouter();
  const { user } = useAuth();
  const isModal = variant === "modal";
  const [stepIndex, setStepIndex] = useState(0);
  const [roles, setRoles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);

  const [industryId, setIndustryId] = useState(DEFAULT_INDUSTRY_ID);
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORY_ID);
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceDetails, setServiceDetails] = useState({});
  const [expandedServiceId, setExpandedServiceId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [stepAlert, setStepAlert] = useState("");
  const [invalidFields, setInvalidFields] = useState({});
  const stepContentRef = useRef(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [paidPlanId, setPaidPlanId] = useState(null);
  const [razorpayPaymentId, setRazorpayPaymentId] = useState(null);
  const [licenseDeclarationAccepted, setLicenseDeclarationAccepted] = useState(false);

  const { payForPlan } = useRazorpayCheckout();

  const totalSteps = SETUP_PROFILE_STEPS.length;
  const currentStep = SETUP_PROFILE_STEPS[stepIndex];

  const categories = useMemo(
    () => getCategoriesForIndustry(industryId),
    [industryId],
  );

  const serviceOptions = useMemo(
    () => getServicesForCategory(categoryId),
    [categoryId],
  );

  const hasOtherLicenseHolder = useMemo(
    () =>
      selectedServices.some(
        (serviceId) =>
          (serviceDetails[serviceId] ?? createEmptyServiceDetail()).licenseHolderType ===
          "other",
      ),
    [selectedServices, serviceDetails],
  );

  const getServiceMeta = useCallback(
    (serviceId) => serviceOptions.find((item) => item.id === serviceId),
    [serviceOptions],
  );

  useEffect(() => {
    fetch("/api/customer/roles")
      .then((res) => res.json())
      .then((result) => {
        if (result?.success && Array.isArray(result.data)) {
          setRoles(result.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedServices.length) {
      setExpandedServiceId("");
      return;
    }
    if (!expandedServiceId || !selectedServices.includes(expandedServiceId)) {
      setExpandedServiceId(selectedServices[0]);
    }
  }, [selectedServices, expandedServiceId]);

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

  const removeServiceChip = (serviceId) => {
    setSelectedServices((prev) => {
      const next = prev.filter((id) => id !== serviceId);
      syncServiceDetails(next);
      return next;
    });
  };

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

  const updateServiceDetail = (serviceId, patch) => {
    Object.keys(patch).forEach((field) => {
      clearFieldInvalid(fieldKey(serviceId, field));
    });
    setServiceDetails((prev) => ({
      ...prev,
      [serviceId]: { ...(prev[serviceId] ?? createEmptyServiceDetail()), ...patch },
    }));
  };

  const handleFilesSelected = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;

    const accepted = [];
    for (const file of incoming) {
      if (file.size > MAX_DOCUMENT_BYTES) {
        toast.error(`${file.name} must be 5MB or smaller`);
        continue;
      }
      accepted.push(file);
    }
    if (!accepted.length) return;

    clearFieldInvalid("documents");
    setStepAlert("");

    const nextDocs = accepted.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      url: "",
    }));

    setDocuments((prev) => [...prev, ...nextDocs]);
  };

  const removeDocument = (id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleIndustryChange = (nextIndustryId) => {
    setIndustryId(nextIndustryId);
    const nextCategories = getCategoriesForIndustry(nextIndustryId);
    const nextCategoryId = nextCategories[0]?.id ?? DEFAULT_CATEGORY_ID;
    setCategoryId(nextCategoryId);
    setSelectedServices([]);
    setServiceDetails({});
  };

  const handleCategoryChange = (nextCategoryId) => {
    setCategoryId(nextCategoryId);
    setSelectedServices([]);
    setServiceDetails({});
  };

  const toggleService = (serviceId) => {
    clearFieldInvalid("services");
    setSelectedServices((prev) => {
      const exists = prev.includes(serviceId);
      const next = exists
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId];
      syncServiceDetails(next);
      return next;
    });
  };

  const validateStep = () => {
    const nextInvalid = {};
    let message = "";

    switch (currentStep.id) {
      case "scope":
        if (!industryId) {
          nextInvalid.industry = true;
          message = "Please select an industry.";
        } else if (!categoryId) {
          nextInvalid.category = true;
          message = "Please select a category.";
        } else if (!selectedServices.length) {
          nextInvalid.services = true;
          message = "Select at least one service.";
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

          if (!detail.startDate) mark("startDate", "Add service start date");
          else if (!detail.isActive && !detail.endDate) mark("endDate", "Add service end date");
          else if (!detail.designation?.trim()) mark("designation", "Add designation");
          else if (!detail.company?.trim()) mark("company", "Add company name");
          else if (!detail.professionalCapacity?.trim()) {
            mark("professionalCapacity", "Select your capacity");
          } else if (!detail.licenseNumber?.trim()) {
            mark("licenseNumber", "Add license number");
          } else if (detail.licenseHolderType === "other") {
            if (!detail.licenseHolderName?.trim()) {
              mark("licenseHolderName", "Add licence holder name");
            } else if (!detail.licenseHolderRelationship?.trim()) {
              mark("licenseHolderRelationship", "Select relationship");
            } else if (!detail.consentLetterUrl?.trim() && !detail.consentLetterFile) {
              mark("consentLetter", "Upload consent letter");
            }
          }
        }
        if (!message && hasOtherLicenseHolder && !licenseDeclarationAccepted) {
          nextInvalid.declaration = true;
          message = "Please confirm the licence holder declaration.";
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
      default:
        break;
    }

    if (message) {
      setStepAlert(message);
      setInvalidFields(nextInvalid);
      if (currentStep.id === "details") {
        const firstService = Object.keys(nextInvalid)
          .find((key) => key.includes("."))
          ?.split(".")[0];
        if (firstService) setExpandedServiceId(firstService);
      }
      stepContentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return false;
    }

    clearValidation();
    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    clearValidation();
    setStepIndex((index) => Math.min(index + 1, totalSteps - 1));
  };

  const goBack = () => {
    clearValidation();
    setStepIndex((index) => Math.max(index - 1, 0));
  };

  useEffect(() => {
    clearValidation();
  }, [stepIndex]);

  const handleDownloadConsentForm = async (serviceId) => {
    const detail = serviceDetails[serviceId] ?? createEmptyServiceDetail();
    const serviceLabel = getServiceLabel(categoryId, serviceId);
    const profileHolderName = user?.name?.trim() || "";
    const profileHolderMobile = user?.phone?.trim() || user?.mobile?.trim() || "";
    const place = [user?.city?.trim(), user?.state?.trim()].filter(Boolean).join(", ");

    if (
      !canGenerateLicenseHolderConsentPdf({
        licenceHolderName: detail.licenseHolderName,
        relationship: detail.licenseHolderRelationship,
        companyName: detail.company,
        profileHolderName,
        profileHolderMobile,
      })
    ) {
      if (!detail.licenseHolderName?.trim()) {
        toast.error("Enter licence holder name before downloading the form");
        return;
      }
      if (!detail.licenseHolderRelationship?.trim()) {
        toast.error("Select relationship before downloading the form");
        return;
      }
      if (!detail.company?.trim()) {
        toast.error("Enter company name before downloading the form");
        return;
      }
      if (!profileHolderName) {
        toast.error("Complete YVITY registration with your full name first");
        return;
      }
      if (!profileHolderMobile) {
        toast.error("Your registered mobile number is required on the consent form");
        return;
      }
      toast.error("Fill in the required fields before downloading the form");
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
      toast.success("Consent form downloaded — get both signatures, then upload");
    } catch {
      toast.error("Could not generate consent form. Please try again.");
    }
  };

  const uploadConsentLetters = async () => {
    const nextDetails = { ...serviceDetails };
    for (const serviceId of selectedServices) {
      const detail = nextDetails[serviceId] ?? createEmptyServiceDetail();
      if (detail.licenseHolderType !== "other") continue;
      if (detail.consentLetterUrl || !detail.consentLetterFile) continue;

      updateServiceDetail(serviceId, { consentUploading: true });
      const formData = new FormData();
      formData.append("file", detail.consentLetterFile);
      const res = await fetch("/api/advisor/verification-documents", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok || !result?.success) {
        throw new Error(result?.message || "Failed to upload consent letter");
      }
      nextDetails[serviceId] = {
        ...detail,
        consentLetterUrl: result.url,
        consentLetterName: detail.consentLetterName || detail.consentLetterFile.name,
        consentLetterFile: null,
        consentUploading: false,
      };
      updateServiceDetail(serviceId, nextDetails[serviceId]);
    }
    return nextDetails;
  };

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

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    if (planId === "free" || planId !== paidPlanId) {
      setPaymentDone(false);
      setPaidPlanId(null);
      setRazorpayPaymentId(null);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const advisorRoleId = resolveAdvisorRoleId(roles, selectedServices[0]);
    if (!advisorRoleId) {
      toast.error("Advisor roles are not available. Please try again later.");
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
      const consentDetails = await uploadConsentLetters();
      const uploadedDocs = await uploadDocuments();
      setUploadingDocs(false);

      const services = buildServicesPayload({
        categoryId,
        selectedServices,
        serviceDetails: consentDetails,
        getServiceMeta,
      });

      const industryLabel = getIndustryLabel(industryId);
      const categoryLabel = getCategoryLabel(industryId, categoryId);
      const bio = `Verified ${categoryLabel} professional in ${industryLabel} on YVITY. Committed to transparent advice and client-first service.`;

      const primaryLicense =
        serviceDetails[selectedServices[0]]?.licenseNumber?.trim() || "";

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
        }),
      });

      const result = await res.json();
      if (!res.ok || result?.success === false) {
        throw new Error(
          result?.message || result?.error || "Failed to submit profile",
        );
      }

      const normalizedLicense = primaryLicense.replace(/\D/g, "");
      if (normalizedLicense.length === 7 && uploadedDocs[0]?.url) {
        await fetch("/api/customer/setprofile/irdai", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            license_number: normalizedLicense,
            certificate_url: uploadedDocs[0].url,
          }),
        }).catch(() => {});
      }

      toast.success(
        isPaidPlan
          ? "Profile submitted for verification"
          : "Your profile is live on YVITY",
      );
      onComplete?.();
      if (isModal) {
        onClose?.();
        router.replace("/dashboard/my-space?setup=submitted");
      } else {
        router.push("/dashboard/my-space?setup=submitted");
      }
    } catch (error) {
      toast.error(error?.message || "Submission failed");
    } finally {
      setSubmitting(false);
      setUploadingDocs(false);
    }
  };

  const stepTitle = useMemo(() => {
    switch (currentStep.id) {
      case "scope":
        return "1. Industry & Services";
      case "details":
        return "2. Service Details";
      case "documents":
        return "3. Upload Supporting Documents";
      case "plan":
        return "4. Choose Your Plan";
      case "review":
        return "5. Review & Submit";
      default:
        return currentStep.label;
    }
  }, [currentStep]);

  const stepSubtitle = useMemo(() => {
    switch (currentStep.id) {
      case "scope":
        return "Select your industry, category, and insurance services";
      case "details":
        return "Add professional details for each selected service";
      case "documents":
        return "Upload verification documents for your selected services";
      case "plan":
        return "Free goes live instantly; Silver and Gold require Razorpay payment and YVITY review";
      case "review":
        return "Please review your information before submitting";
      default:
        return "";
    }
  }, [currentStep]);

  if (isModal && !isOpen) {
    return null;
  }

  const footer = (
    <>
      <SetupModalProgress stepIndex={stepIndex} totalSteps={totalSteps} />
      {currentStep.id !== "review" ? (
        <PrimaryContinueButton
          onClick={goNext}
          label={
            currentStep.id === "documents" ? "Choose plan" : "Continue"
          }
        />
      ) : null}
    </>
  );

  const stepContent = (
    <>
        {stepAlert ? (
          <div
            ref={stepContentRef}
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 font-poppins text-xs leading-relaxed text-red-700"
          >
            {stepAlert}
          </div>
        ) : (
          <div ref={stepContentRef} className="sr-only" aria-hidden />
        )}

        {currentStep.id === "scope" ? (
          <div className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="setup-industry">
                Industry
              </label>
              <select
                id="setup-industry"
                value={industryId}
                onChange={(e) => {
                  clearFieldInvalid("industry");
                  handleIndustryChange(e.target.value);
                }}
                className={`${selectClass} ${invalidClass("industry")}`}
              >
                <option value="">Select industry</option>
                {ONBOARDING_INDUSTRIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="setup-category">
                Category
              </label>
              <select
                id="setup-category"
                value={categoryId}
                onChange={(e) => {
                  clearFieldInvalid("category");
                  handleCategoryChange(e.target.value);
                }}
                disabled={!industryId}
                className={`${selectClass} disabled:cursor-not-allowed disabled:bg-[#F1F5F9]/80 ${invalidClass("category")}`}
              >
                <option value="">Select category</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={invalidFields.services ? "rounded-xl ring-1 ring-red-200/80 p-1" : ""}>
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
              <div
                className={`setup-service-pills -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-2.5 sm:overflow-visible sm:px-0 sm:pb-0 ${
                  !categoryId ? "pointer-events-none opacity-50" : ""
                }`}
              >
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
                  Tap one or more insurance services to continue.
                </p>
              ) : null}
            </div>

            <InfoNotice>
              Client counts, sum insured, claims, and claim ratio can be added
              later from <span className="font-semibold">Edit Service</span> in
              your workspace.
            </InfoNotice>

          </div>
        ) : null}

        {currentStep.id === "details" ? (
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedServices.map((serviceId) => {
                const label = getServiceLabel(categoryId, serviceId);
                const detail =
                  serviceDetails[serviceId] ?? createEmptyServiceDetail();
                return (
                  <LuxuryChip
                    key={serviceId}
                    label={label}
                    badge={detail.isActive ? "Active" : undefined}
                    onRemove={() => removeServiceChip(serviceId)}
                  />
                );
              })}
            </div>

            <div className="space-y-3">
              {selectedServices.map((serviceId) => {
                const label = getServiceLabel(categoryId, serviceId);
                const detail =
                  serviceDetails[serviceId] ?? createEmptyServiceDetail();
                const expanded = expandedServiceId === serviceId;

                return (
                  <AccordionSection
                    key={serviceId}
                    title={`${label} Details`}
                    badge={detail.isActive ? "Active" : undefined}
                    expanded={expanded}
                    onToggle={() =>
                      setExpandedServiceId(expanded ? "" : serviceId)
                    }
                  >
                        <div>
                          <label className={labelClass}>
                            Designation <span className="text-[#EF4444]">*</span>
                          </label>
                          <input
                            type="text"
                            value={detail.designation}
                            onChange={(e) =>
                              updateServiceDetail(serviceId, {
                                designation: e.target.value,
                              })
                            }
                            placeholder="e.g. Senior LIC Advisor"
                            className={fieldClass}
                            required
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            Company name <span className="text-[#EF4444]">*</span>
                          </label>
                          <input
                            type="text"
                            value={detail.company}
                            onChange={(e) =>
                              updateServiceDetail(serviceId, {
                                company: e.target.value,
                              })
                            }
                            placeholder="e.g. LIC of India, HDFC Life"
                            className={fieldClass}
                            required
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            Licence holder{" "}
                            <span className="text-[#EF4444]">*</span>
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
                                updateServiceDetail(serviceId, {
                                  licenseHolderType: "other",
                                })
                              }
                              className={`rounded-xl border px-3 py-2.5 text-left font-poppins text-xs font-semibold ${
                                detail.licenseHolderType === "other"
                                  ? "border-[#0A4A4A] bg-[#F0FAFA] text-[#0A4A4A]"
                                  : "border-[#E2E8F0] text-[#64748B]"
                              }`}
                            >
                              Other — e.g. spouse or family member
                            </button>
                          </div>
                          <p className="mt-1 font-poppins text-[11px] text-[#94A3B8]">
                            Choose Self when the IRDAI licence is in your name. Choose Other when
                            you represent someone else&apos;s appointment for this company.
                          </p>
                        </div>

                        {detail.licenseHolderType === "other" ? (
                          <>
                            <div>
                              <label className={labelClass}>
                                Licence holder name{" "}
                                <span className="text-[#EF4444]">*</span>
                              </label>
                              <input
                                type="text"
                                value={detail.licenseHolderName}
                                onChange={(e) =>
                                  updateServiceDetail(serviceId, {
                                    licenseHolderName: e.target.value,
                                  })
                                }
                                placeholder="As printed on the IRDAI certificate"
                                className={fieldClass}
                                required
                              />
                            </div>

                            <div>
                              <label className={labelClass}>
                                Relationship{" "}
                                <span className="text-[#EF4444]">*</span>
                              </label>
                              <select
                                value={detail.licenseHolderRelationship}
                                onChange={(e) =>
                                  updateServiceDetail(serviceId, {
                                    licenseHolderRelationship: e.target.value,
                                  })
                                }
                                className={selectClass}
                                required
                              >
                                <option value="">Select relationship</option>
                                {LICENSE_HOLDER_RELATIONSHIPS.map((option) => (
                                  <option key={option.id} value={option.id}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="rounded-2xl border border-[#0A4A4A]/15 bg-[#F8FAFC] px-4 py-3.5">
                              <p className="font-poppins text-xs font-semibold text-[#0F172A]">
                                Step 1 — Download standard consent form
                              </p>
                              <p className="mt-1 font-poppins text-[11px] leading-relaxed text-[#64748B]">
                                Read the form carefully. The{" "}
                                <span className="font-semibold text-[#0F172A]">
                                  licence holder
                                </span>{" "}
                                and{" "}
                                <span className="font-semibold text-[#0F172A]">
                                  you (profile holder)
                                </span>{" "}
                                must both sign. Relationship on the form:{" "}
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

                            <div>
                              <label className={labelClass}>
                                Step 2 — Upload signed consent letter{" "}
                                <span className="text-[#EF4444]">*</span>
                              </label>
                              {detail.consentLetterUrl ? (
                                <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5">
                                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#0A4A4A]">
                                    <FileText size={18} />
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate font-poppins text-xs font-semibold text-[#0F172A]">
                                      {detail.consentLetterName || "Consent letter uploaded"}
                                    </p>
                                    <p className="font-poppins text-[11px] text-[#64748B]">
                                      Signed permission from licence holder
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
                                    className="rounded-lg p-2 text-[#64748B] transition hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                                    aria-label="Remove consent letter"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#0A4A4A]/20 bg-white/70 px-4 py-6 transition hover:border-[#F59E0B]/40 hover:bg-[#FFFBF2]">
                                  <CloudUpload className="mb-2 h-7 w-7 text-[#64748B]" />
                                  <span className="font-poppins text-xs font-semibold text-[#0F172A]">
                                    {detail.consentUploading
                                      ? "Uploading…"
                                      : "Upload consent letter"}
                                  </span>
                                  <span className="mt-1 text-center font-poppins text-[11px] text-[#64748B]">
                                    JPG, PNG, or PDF (max 5MB)
                                  </span>
                                  <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                                    className="sr-only"
                                    disabled={detail.consentUploading}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      if (file.size > 5 * 1024 * 1024) {
                                        toast.error("Consent letter must be 5MB or smaller");
                                        return;
                                      }
                                      updateServiceDetail(serviceId, {
                                        consentLetterFile: file,
                                        consentLetterName: file.name,
                                      });
                                      e.target.value = "";
                                    }}
                                  />
                                </label>
                              )}
                              <p className="mt-1 font-poppins text-[11px] text-[#94A3B8]">
                                {LICENSE_HOLDER_CONSENT_HINT}
                              </p>
                            </div>
                          </>
                        ) : null}

                        <div>
                          <label className={labelClass}>
                            Account type{" "}
                            <span className="text-[#EF4444]">*</span>
                          </label>
                          <ServiceAccountTypePicker
                            variant="setup"
                            value={detail.professionalCapacity || "individual_agent"}
                            onChange={(capacityId) =>
                              updateServiceDetail(serviceId, {
                                professionalCapacity: capacityId,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            Service Start Date{" "}
                            <span className="text-[#EF4444]">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={detail.startDate}
                              onChange={(e) =>
                                updateServiceDetail(serviceId, {
                                  startDate: e.target.value,
                                })
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
                        </div>

                        <div>
                          <label className={labelClass}>
                            Is this service active?
                          </label>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateServiceDetail(serviceId, {
                                  isActive: true,
                                  endDate: "",
                                })
                              }
                              className={`rounded-xl border px-3 py-2.5 font-poppins text-xs font-semibold ${
                                detail.isActive
                                  ? "border-[#0A4A4A] bg-[#F0FAFA] text-[#0A4A4A]"
                                  : "border-[#E2E8F0] text-[#64748B]"
                              }`}
                            >
                              Currently Active
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateServiceDetail(serviceId, { isActive: false })
                              }
                              className={`rounded-xl border px-3 py-2.5 font-poppins text-xs font-semibold ${
                                !detail.isActive
                                  ? "border-[#0A4A4A] bg-[#F0FAFA] text-[#0A4A4A]"
                                  : "border-[#E2E8F0] text-[#64748B]"
                              }`}
                            >
                              No Longer Active
                            </button>
                          </div>
                        </div>

                        {!detail.isActive ? (
                          <div>
                            <label className={labelClass}>
                              Service End Date{" "}
                              <span className="text-[#EF4444]">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="date"
                                value={detail.endDate}
                                min={detail.startDate || undefined}
                                onChange={(e) =>
                                  updateServiceDetail(serviceId, {
                                    endDate: e.target.value,
                                  })
                                }
                                className={`${fieldClass} pr-10`}
                                required
                              />
                              <Calendar
                                size={16}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                              />
                            </div>
                          </div>
                        ) : null}

                        <div>
                          <label className={labelClass}>
                            License Number{" "}
                            <span className="text-[#EF4444]">*</span>
                          </label>
                          <input
                            type="text"
                            value={detail.licenseNumber}
                            onChange={(e) =>
                              updateServiceDetail(serviceId, {
                                licenseNumber: e.target.value,
                              })
                            }
                            placeholder="IRDAI License Number"
                            className={`${fieldClass} ${invalidClass(fieldKey(serviceId, "licenseNumber"))}`}
                          />
                        </div>
                  </AccordionSection>
                );
              })}
            </div>

            {hasOtherLicenseHolder ? (
              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#FFFBF2]/80 px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={licenseDeclarationAccepted}
                  onChange={(e) => setLicenseDeclarationAccepted(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 rounded border-[#CBD5E1] text-[#0A4A4A] focus:ring-[#F59E0B]"
                />
                <span className="font-poppins text-xs leading-relaxed text-[#475569]">
                  {LICENSE_HOLDER_DECLARATION}
                </span>
              </label>
            ) : null}
          </div>
        ) : null}

        {currentStep.id === "documents" ? (
          <div>
            <label
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white/70 px-4 py-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition duration-300 hover:border-[#F59E0B]/40 hover:bg-[#FFFBF2] ${
                invalidFields.documents
                  ? "border-red-300 bg-red-50/40"
                  : "border-[#0A4A4A]/20"
              }`}
            >
              <CloudUpload className="mb-2 h-8 w-8 text-[#64748B]" />
              <span className="font-poppins text-sm font-semibold text-[#0F172A]">
                Choose Files
              </span>
              <span className="mt-1 font-poppins text-xs text-[#64748B]">
                JPG, PNG, PDF (Max 5MB each)
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
                      <p className="font-poppins text-xs text-[#64748B]">
                        {formatFileSize(doc.size)}
                      </p>
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
              Your documents are secure and will be used only for verification
              purposes.
            </div>

          </div>
        ) : null}

        {currentStep.id === "plan" ? (
          <SetupPlanStep
            selectedPlan={selectedPlan}
            onSelectPlan={handlePlanSelect}
            paymentDone={paymentDone}
            paidPlanId={paidPlanId}
          />
        ) : null}

        {currentStep.id === "review" ? (
          <div>
            <dl className="divide-y divide-[#E2E8F0] rounded-xl border border-[#E2E8F0]">
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
              <div className="px-4 py-3">
                <dt className="mb-2 font-poppins text-sm text-[#64748B]">
                  Services Selected
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {selectedServices.map((serviceId) => {
                    const detail =
                      serviceDetails[serviceId] ?? createEmptyServiceDetail();
                    return (
                      <span
                        key={serviceId}
                        className="inline-flex items-center gap-1 rounded-full bg-[#F0FAFA] px-2.5 py-1 font-poppins text-xs font-semibold text-[#0A4A4A]"
                      >
                        {getServiceLabel(categoryId, serviceId)}
                        {detail.isActive ? (
                          <span className="text-[10px] font-bold uppercase text-[#16A34A]">
                            Active
                          </span>
                        ) : null}
                        {detail.designation?.trim() ? (
                          <span className="text-[10px] text-[#64748B]">
                            · {detail.designation.trim()}
                          </span>
                        ) : null}
                      </span>
                    );
                  })}
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="font-poppins text-sm text-[#64748B]">
                  Total Documents
                </dt>
                <dd className="font-poppins text-sm font-semibold text-[#0F172A]">
                  {documents.length} Document{documents.length === 1 ? "" : "s"}
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
                <dt className="font-poppins text-sm text-[#64748B]">Status</dt>
                <dd className="font-poppins text-sm font-bold text-[#16A34A]">
                  {selectedPlan === "free" ? "Ready to go live" : "Ready for verification"}
                </dd>
              </div>
            </dl>

            <div
              className={`mt-4 rounded-xl border px-4 py-3 font-poppins text-xs leading-relaxed backdrop-blur-sm ${
                selectedPlan === "free"
                  ? "border-[#BBF7D0]/80 bg-[#F0FDF4]/90 text-[#166534]"
                  : "border-[#FDE68A]/80 bg-[#FFFBEB]/90 text-[#92400E]"
              }`}
            >
              {selectedPlan === "free" ? (
                <>
                  Your profile will go live immediately after submit. Only your identity is
                  verified; services are not YVITY-verified on the Free plan.
                </>
              ) : (
                <>
                  You will pay with Razorpay on submit (if not paid yet). Our team will verify your
                  profile and services — usually within 24–48 hours.
                </>
              )}
            </div>
          </div>
        ) : null}
    </>
  );

  const reviewFooter = currentStep.id === "review" ? (
    <>
      <SetupModalProgress stepIndex={stepIndex} totalSteps={totalSteps} />
      <PrimaryContinueButton
        variant="gold"
        onClick={handleSubmit}
        loading={submitting}
        label={
          submitting
            ? uploadingDocs
              ? "Uploading documents..."
              : selectedPlan === "silver" || selectedPlan === "gold"
                ? paymentDone
                  ? "Submitting..."
                  : "Processing payment..."
                : "Submitting..."
            : selectedPlan === "free"
              ? "Go live"
              : paymentDone
                ? "Submit for verification"
                : "Pay & submit"
        }
      />
    </>
  ) : (
    footer
  );

  if (isModal) {
    return (
      <SetupProfileLuxuryModal
        isOpen={isOpen}
        onClose={onClose}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        title={stepTitle}
        subtitle={stepSubtitle}
        onBack={stepIndex > 0 ? goBack : undefined}
        footer={reviewFooter}
      >
        {stepContent}
      </SetupProfileLuxuryModal>
    );
  }

  return (
    <SetupProfileLuxuryModal
      isOpen
      onClose={() => router.push("/dashboard/my-space")}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title={stepTitle}
      subtitle={stepSubtitle}
      onBack={stepIndex > 0 ? goBack : undefined}
      footer={reviewFooter}
    >
      {stepContent}
    </SetupProfileLuxuryModal>
  );
}

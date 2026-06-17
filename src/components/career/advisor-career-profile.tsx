"use client";

import Link from "next/link";
import { useState } from "react";
import { Briefcase, GraduationCap, Plus, Sparkles, UserRound } from "lucide-react";
import { SectionCompletionGuidance } from "@/components/advisor/guidance/section-completion-guidance";
import { CareerSectionsAccordion } from "@/components/career/career-sections-accordion";
import {
  CertificationEditModal,
  EducationEditModal,
  ExperienceEditModal,
} from "@/components/career/career-edit-modals";
import { SectionProfileBanner } from "@/components/sections/section-profile-banner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { uid } from "@/lib/career-store";
import type { CareerData, Certification, Education, Experience } from "@/lib/career-types";
import { Button } from "@/components/ui/button";
import { usePublicProfileUrls } from "@/hooks/use-public-profile-urls";
import { useAuth } from "@/context/AuthUserContext";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";

type EditTarget =
  | { kind: "experience"; item: Experience }
  | { kind: "certification"; item: Certification }
  | { kind: "education"; item: Education };

type DeleteTarget =
  | { kind: "experience"; id: string; label: string }
  | { kind: "certification"; id: string; label: string }
  | { kind: "education"; id: string; label: string };

export function AdvisorCareerProfile({
  data,
  setData,
}: {
  data: CareerData;
  setData: (data: CareerData) => void;
}) {
  const { previewPath } = usePublicProfileUrls();
  const { advisor } = useAuth();
  const profileApproved = isAdvisorProfileApproved(advisor);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const saveExperience = (item: Experience) => {
    const exists = data.experiences.some((e) => e.id === item.id);
    setData({
      ...data,
      experiences: exists
        ? data.experiences.map((e) => (e.id === item.id ? item : e))
        : [...data.experiences, item],
    });
    setEditTarget(null);
  };

  const saveCertification = (item: Certification) => {
    const exists = data.certifications.some((c) => c.id === item.id);
    setData({
      ...data,
      certifications: exists
        ? data.certifications.map((c) => (c.id === item.id ? item : c))
        : [...data.certifications, item],
    });
    setEditTarget(null);
  };

  const saveEducation = (item: Education) => {
    const exists = data.education.some((e) => e.id === item.id);
    setData({
      ...data,
      education: exists
        ? data.education.map((e) => (e.id === item.id ? item : e))
        : [...data.education, item],
    });
    setEditTarget(null);
  };

  const deleteExperience = (id: string) => {
    const item = data.experiences.find((e) => e.id === id);
    setDeleteTarget({ kind: "experience", id, label: item?.role || "this experience" });
  };

  const deleteCertification = (id: string) => {
    const item = data.certifications.find((c) => c.id === id);
    setDeleteTarget({ kind: "certification", id, label: item?.name || "this certification" });
  };

  const deleteEducation = (id: string) => {
    const item = data.education.find((e) => e.id === id);
    setDeleteTarget({ kind: "education", id, label: item?.degree || "this education entry" });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "experience") {
      setData({ ...data, experiences: data.experiences.filter((e) => e.id !== deleteTarget.id) });
    } else if (deleteTarget.kind === "certification") {
      setData({ ...data, certifications: data.certifications.filter((c) => c.id !== deleteTarget.id) });
    } else {
      setData({ ...data, education: data.education.filter((e) => e.id !== deleteTarget.id) });
    }
    setDeleteTarget(null);
  };

  const addExperience = () => {
    setEditTarget({
      kind: "experience",
      item: {
        id: uid("exp"),
        role: "",
        company: "",
        category: "",
        location: "",
        start: "",
        end: "",
        bullets: [""],
        verified: false,
      },
    });
  };

  const addCertification = () => {
    setEditTarget({
      kind: "certification",
      item: { id: uid("cert"), name: "", issuer: "", year: "", status: "pending", bullets: [""] },
    });
  };

  const addEducation = () => {
    setEditTarget({
      kind: "education",
      item: { id: uid("edu"), degree: "", institution: "", location: "", year: "" },
    });
  };

  return (
    <>
      <SectionProfileBanner className="mb-6 sm:mb-8" />

      <SectionCompletionGuidance healthId="photo" icon={UserRound} />
      <SectionCompletionGuidance healthId="career" icon={Briefcase} />
      <SectionCompletionGuidance healthId="education" icon={GraduationCap} />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div className="flex flex-wrap gap-2">
          <Button onClick={addExperience} size="sm" className="gap-1.5">
            <Plus className="size-4" /> Add experience
          </Button>
          <Button onClick={addCertification} size="sm" variant="secondary" className="gap-1.5">
            <Plus className="size-4" /> Add certification
          </Button>
          <Button onClick={addEducation} size="sm" variant="secondary" className="gap-1.5">
            <Plus className="size-4" /> Add education
          </Button>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground mb-4 pl-0.5">
        Verified entries display a <span className="font-semibold text-foreground/70">YVITY Verified</span> badge on your public profile after YVITY review.
      </p>

      <CareerSectionsAccordion
        experiences={data.experiences}
        certifications={data.certifications}
        education={data.education}
        editable={{
          experiences: {
            onEdit: (id) => {
              const item = data.experiences.find((e) => e.id === id);
              if (item) setEditTarget({ kind: "experience", item });
            },
            onDelete: deleteExperience,
          },
          certifications: {
            onEdit: (id) => {
              const item = data.certifications.find((c) => c.id === id);
              if (item) setEditTarget({ kind: "certification", item });
            },
            onDelete: deleteCertification,
          },
          education: {
            onEdit: (id) => {
              const item = data.education.find((e) => e.id === id);
              if (item) setEditTarget({ kind: "education", item });
            },
            onDelete: deleteEducation,
          },
        }}
        profileApproved={profileApproved}
      />

      <div className="mt-8 flex items-center gap-2 rounded-2xl glass border border-white/10 p-4 text-xs text-muted-foreground">
        <Sparkles className="size-4 text-primary shrink-0" />
        Changes save automatically. Preview the{" "}
        <Link
          href={previewPath}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline underline-offset-2"
        >
          public profile
        </Link>
        .
      </div>

      {editTarget?.kind === "experience" && (
        <ExperienceEditModal
          item={editTarget.item}
          onClose={() => setEditTarget(null)}
          onSave={saveExperience}
        />
      )}
      {editTarget?.kind === "certification" && (
        <CertificationEditModal
          item={editTarget.item}
          onClose={() => setEditTarget(null)}
          onSave={saveCertification}
        />
      )}
      {editTarget?.kind === "education" && (
        <EducationEditModal
          item={editTarget.item}
          onClose={() => setEditTarget(null)}
          onSave={saveEducation}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => { if (!next) setDeleteTarget(null); }}
        title="Delete entry?"
        description={deleteTarget ? `"${deleteTarget.label}" will be removed from your profile.` : ""}
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
}

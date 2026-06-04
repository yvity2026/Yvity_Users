"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ProfessionalJourneySection,
  ProfessionalJourneyHeader,
} from "@/components/career/professional-journey";
import { CertificationsSection, CertificationsHeader } from "@/components/career/certifications";
import { EducationSection, EducationHeader } from "@/components/career/education";
import type { CareerSectionEditable } from "@/components/career/career-item-actions";
import type { Certification, Education, Experience } from "@/lib/career-types";
import { cn } from "@/lib/utils";

export type CareerAccordionEditable = {
  experiences?: CareerSectionEditable;
  certifications?: CareerSectionEditable;
  education?: CareerSectionEditable;
};

const cardClass =
  "glass-strong rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden border-b border-white/10";

const triggerClass = cn(
  "group gap-3 px-4 py-4 sm:px-6 sm:py-5",
  "hover:no-underline hover:bg-white/[0.03]",
  "active:bg-white/[0.06]",
  "transition-all duration-200 ease-out motion-reduce:transition-none",
  "[&>svg]:ml-2 [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-[oklch(0.82_0.13_205)]",
  "[&>svg]:transition-transform [&>svg]:duration-300",
);

const contentClass = "px-4 pb-5 sm:px-6 sm:pb-8";

export function CareerSectionsAccordion({
  experiences,
  certifications,
  education,
  editable,
  showCareerJourney = true,
  showEducationalJourney = true,
}: {
  experiences: Experience[];
  certifications: Certification[];
  education: Education[];
  editable?: CareerAccordionEditable;
  showCareerJourney?: boolean;
  showEducationalJourney?: boolean;
}) {
  return (
    <Accordion type="multiple" className="space-y-3 sm:space-y-4">
      {showCareerJourney && (
        <AccordionItem value="professional-journey" className={cardClass}>
          <AccordionTrigger className={triggerClass}>
            <ProfessionalJourneyHeader compact />
          </AccordionTrigger>
          <AccordionContent className={contentClass}>
            <ProfessionalJourneySection
              experiences={experiences}
              embedded
              editable={editable?.experiences}
            />
          </AccordionContent>
        </AccordionItem>
      )}

      {showCareerJourney && (
        <AccordionItem value="certifications" className={cardClass}>
          <AccordionTrigger className={triggerClass}>
            <CertificationsHeader compact />
          </AccordionTrigger>
          <AccordionContent className={contentClass}>
            <CertificationsSection
              items={certifications}
              embedded
              editable={editable?.certifications}
            />
          </AccordionContent>
        </AccordionItem>
      )}

      {showEducationalJourney && (
        <AccordionItem value="education" className={cardClass}>
          <AccordionTrigger className={triggerClass}>
            <EducationHeader compact />
          </AccordionTrigger>
          <AccordionContent className={contentClass}>
            <EducationSection items={education} embedded editable={editable?.education} />
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}

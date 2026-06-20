/**
 * Persists SetupMyProfileFlow form state to localStorage so advisors can
 * resume from where they left off after closing or refreshing.
 *
 * Draft key: yvity_setup_draft_<userId>
 * Only serialisable data is stored — File objects are stripped; only
 * documents that have already been uploaded (have a URL) are kept.
 */

import { useCallback } from "react";

const DRAFT_VERSION = 1;

export type ServiceDetailDraft = {
  company?: string;
  licenseNumber?: string;
  designation?: string;
  startDate?: string;
  professionalCapacity?: string;
  licenseHolderType?: string;
  licenseHolderName?: string;
  licenseHolderRelationship?: string;
  consentLetterUrl?: string;
  consentLetterName?: string;
};

export type DocumentDraft = {
  id: string;
  name: string;
  size: number;
  url: string;
};

export type SetupDraft = {
  version: number;
  savedAt: string;
  stepIndex: number;
  industryId: string;
  categoryId: string;
  selectedServices: string[];
  serviceDetails: Record<string, ServiceDetailDraft>;
  documents: DocumentDraft[];
  selectedPlan: string;
  paymentDone: boolean;
  paidPlanId: string | null;
  razorpayPaymentId: string | null;
  chosenHandle: string | null;
};

function draftKey(userId: string) {
  return `yvity_setup_draft_${userId}`;
}

function str(v: unknown): string | undefined {
  return v == null ? undefined : String(v);
}

function cleanServiceDetails(
  details: Record<string, Record<string, unknown>>,
): Record<string, ServiceDetailDraft> {
  return Object.fromEntries(
    Object.entries(details).map(([id, detail]) => [
      id,
      {
        company: str(detail.company),
        licenseNumber: str(detail.licenseNumber),
        designation: str(detail.designation),
        startDate: str(detail.startDate),
        professionalCapacity: str(detail.professionalCapacity),
        licenseHolderType: str(detail.licenseHolderType),
        licenseHolderName: str(detail.licenseHolderName),
        licenseHolderRelationship: str(detail.licenseHolderRelationship),
        consentLetterUrl: str(detail.consentLetterUrl),
        consentLetterName: str(detail.consentLetterName),
      } satisfies ServiceDetailDraft,
    ]),
  );
}

export function useSetupDraft(userId: string | null | undefined) {
  const saveDraft = useCallback(
    (state: Omit<SetupDraft, "version" | "savedAt">) => {
      if (!userId) return;
      try {
        const draft: SetupDraft = {
          version: DRAFT_VERSION,
          savedAt: new Date().toISOString(),
          ...state,
          // Strip File objects from serviceDetails
          serviceDetails: cleanServiceDetails(
            state.serviceDetails as Record<string, Record<string, unknown>>,
          ),
          // Only keep uploaded documents (those with a URL)
          documents: (state.documents as Array<{ id: string; name: string; size: number; url: string }>)
            .filter((d) => d.url)
            .map(({ id, name, size, url }) => ({ id, name, size, url })),
        };
        localStorage.setItem(draftKey(userId), JSON.stringify(draft));
      } catch {
        // localStorage quota or SSR — silently ignore
      }
    },
    [userId],
  );

  const loadDraft = useCallback((): SetupDraft | null => {
    if (!userId) return null;
    try {
      const raw = localStorage.getItem(draftKey(userId));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SetupDraft;
      if (parsed.version !== DRAFT_VERSION) return null;
      return parsed;
    } catch {
      return null;
    }
  }, [userId]);

  const clearDraft = useCallback(() => {
    if (!userId) return;
    try {
      localStorage.removeItem(draftKey(userId));
    } catch {
      // ignore
    }
  }, [userId]);

  const hasDraft = useCallback((): boolean => {
    if (!userId) return false;
    try {
      return Boolean(localStorage.getItem(draftKey(userId)));
    } catch {
      return false;
    }
  }, [userId]);

  return { saveDraft, loadDraft, clearDraft, hasDraft };
}

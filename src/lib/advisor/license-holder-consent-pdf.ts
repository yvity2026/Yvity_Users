import { relationshipLabel } from "@/lib/advisor/service-license-holder";

export type LicenseHolderConsentPdfInput = {
  licenceHolderName: string;
  licenceNumber: string;
  companyName: string;
  serviceLabel: string;
  relationship: string;
  profileHolderName: string;
  profileHolderMobile: string;
  place?: string;
  date?: Date;
};

function slugifyFilename(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function formatLetterDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** Minimum fields required before generating the consent PDF. */
export function canGenerateLicenseHolderConsentPdf(input: {
  licenceHolderName?: string;
  relationship?: string;
  companyName?: string;
  profileHolderName?: string;
  profileHolderMobile?: string;
}): boolean {
  return Boolean(
    input.licenceHolderName?.trim() &&
      input.relationship?.trim() &&
      input.companyName?.trim() &&
      input.profileHolderName?.trim() &&
      input.profileHolderMobile?.trim(),
  );
}

/**
 * Standard YVITY licence-holder consent letter — single A4 page, English only.
 * Licence holder and profile holder signatures are both mandatory (wet sign on printout).
 */
export async function downloadLicenseHolderConsentPdf(
  input: LicenseHolderConsentPdfInput,
): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 42;
  const contentW = pageW - margin * 2;
  const lineH = 11.5;
  let y = margin;

  const licenceHolder = input.licenceHolderName.trim();
  const licenceNo = input.licenceNumber.trim() || "________________";
  const company = input.companyName.trim();
  const service = input.serviceLabel.trim();
  const relationship = relationshipLabel(input.relationship) || input.relationship.trim();
  const profileHolder = input.profileHolderName.trim();
  const profileMobile = input.profileHolderMobile.trim();
  const place = input.place?.trim() || "________________";
  const letterDate = formatLetterDate(input.date ?? new Date());
  const displayLine = `Licence holder: ${licenceHolder} (${relationship})`;

  const ensureSpace = (needed: number) => {
    if (y + needed > 800) return;
  };

  const writeLines = (text: string, size = 8.5, bold = false, indent = 0) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, contentW - indent);
    for (const row of lines) {
      ensureSpace(lineH);
      doc.text(row, margin + indent, y);
      y += lineH;
    }
  };

  const writeGap = (gap = 6) => {
    y += gap;
  };

  // Header
  doc.setFillColor(10, 74, 74);
  doc.rect(0, 0, pageW, 52, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("YVITY — Licence Holder Consent Form", margin, 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Standard consent for profile operated under another person's IRDAI licence", margin, 38);

  y = 68;
  doc.setTextColor(30, 41, 59);

  writeLines("To,", 9, true);
  writeLines("The Administrator", 8.5);
  writeLines("YVITY Platform", 8.5);
  writeGap(4);
  writeLines(`Date: ${letterDate}`, 8.5);
  writeLines(`Place: ${place}`, 8.5);
  writeGap(4);
  writeLines(
    `Subject: Consent for use of IRDAI licence and display of licence holder name on YVITY — ${company} — ${service}`,
    8.5,
    true,
  );
  writeGap(5);
  writeLines("Dear Sir/Madam,", 8.5);
  writeGap(3);

  writeLines(
    `I, ${licenceHolder}, holder of IRDAI licence/agent code No. ${licenceNo}, appointed with ${company}, hereby state and confirm as follows:`,
    8.5,
  );
  writeGap(4);

  writeLines("1. Relationship and authorization", 8.5, true);
  writeLines(
    `I am the ${relationship} of ${profileHolder}. I voluntarily authorize ${profileHolder} to conduct insurance-related business and client interactions on YVITY using my licence and in my capacity as licence holder for the said company appointment, in accordance with applicable IRDAI and insurer rules.`,
    8.5,
    false,
    8,
  );
  writeGap(3);

  writeLines("2. Display on YVITY", 8.5, true);
  writeLines(
    `I have no objection to YVITY displaying my name on the public profile of ${profileHolder} as "${displayLine}" for ${company} — ${service}. I understand that my licence number will not be shown on the public profile and may be used only for verification and administrative purposes on YVITY.`,
    8.5,
    false,
    8,
  );
  writeGap(3);

  writeLines("3. Responsibilities", 8.5, true);
  writeLines(
    `I confirm that I hold a valid IRDAI licence (or held one for the period stated) and am duly appointed with ${company}. ${profileHolder} has my permission to represent this appointment on YVITY and to serve customers in good faith. I remain primarily responsible for compliance of my licence with IRDAI, insurers, and applicable law. ${profileHolder} is responsible for the accuracy of their YVITY profile and for business conducted through that profile. We will not misrepresent identity, licence status, or company appointment.`,
    8.5,
    false,
    8,
  );
  writeGap(3);

  writeLines("4. YVITY's role", 8.5, true);
  writeLines(
    "YVITY is a technology platform that facilitates advisor profiles and client discovery. YVITY does not provide legal or compliance advice and does not act as my agent, employer, or insurer. YVITY may verify documents in good faith but is not responsible for disputes, losses, or legal claims arising from misrepresentation, breach of IRDAI/insurer rules, or unauthorized use of my licence, except to the extent required by applicable law.",
    8.5,
    false,
    8,
  );
  writeGap(3);

  writeLines("5. Revocation", 8.5, true);
  writeLines(
    "I may revoke this consent by written notice to YVITY and the profile holder. Until revocation is acknowledged by YVITY, this consent remains in effect for the stated service/company on the platform.",
    8.5,
    false,
    8,
  );
  writeGap(3);

  writeLines("6. Documents", 8.5, true);
  writeLines(
    "A copy of my IRDAI licence or appointment letter may be provided to YVITY for verification when requested.",
    8.5,
    false,
    8,
  );
  writeGap(8);

  // Signature blocks — two columns
  const colW = (contentW - 16) / 2;
  const sigTop = y;
  const sigLine = (x: number, labelY: number, label: string, value?: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(label, x, labelY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    if (value) {
      doc.text(value, x, labelY + 11);
    }
    doc.setDrawColor(148, 163, 184);
    doc.line(x, labelY + 28, x + colW - 8, labelY + 28);
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Licence holder (IRDAI certificate holder)", margin, sigTop);
  doc.text("Profile holder (YVITY advisor — mandatory signature)", margin + colW + 16, sigTop);

  const blockY = sigTop + 14;
  sigLine(margin, blockY, "Full name:", licenceHolder);
  sigLine(margin + colW + 16, blockY, "Full name:", profileHolder);

  sigLine(margin, blockY + 38, "IRDAI licence / agent code:", licenceNo);
  sigLine(margin + colW + 16, blockY + 38, "Mobile (YVITY registered):", profileMobile);

  sigLine(margin, blockY + 76, "Company:", company);
  sigLine(margin + colW + 16, blockY + 76, "Signature (mandatory):", undefined);

  sigLine(margin, blockY + 114, "Signature:", undefined);
  sigLine(margin + colW + 16, blockY + 114, "Date:", undefined);

  sigLine(margin, blockY + 152, "Date:", undefined);

  y = blockY + 172;
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.text(
    "Both licence holder and profile holder must sign. Upload a clear scan or photo of this signed form.",
    margin,
    y,
  );
  doc.text("Generated via YVITY — yvity.in", margin, y + 10);

  const filename = `yvity-licence-consent-${slugifyFilename(company || "service")}.pdf`;
  doc.save(filename);
}

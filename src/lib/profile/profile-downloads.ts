import { getPublicProfileLiveUrl } from "@/lib/public-profile-url";

export type ProfileDownloadInput = {
  name: string;
  title: string;
  location: string;
  companyName: string;
  phone: string;
  email: string;
  heroBio: string;
  rating: number | null;
  profileHeroStat: { value: string; label: string };
  experienceDisplay: string;
  serviceLabels: string[];
  ctaDescription: string;
  profileSlug: string;
};

function slugifyFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolveProfileUrl(input: ProfileDownloadInput, origin?: string): string {
  const base =
    origin?.replace(/\/$/, "") ?? (typeof window !== "undefined" ? window.location.origin : "");
  return getPublicProfileLiveUrl(input.profileSlug).startsWith("http")
    ? getPublicProfileLiveUrl(input.profileSlug)
    : `${base}${getPublicProfileLiveUrl(input.profileSlug)}`;
}

export async function downloadProfilePdf(input: ProfileDownloadInput): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  let y = margin;
  const line = 18;
  const maxWidth = 500;

  const addText = (text: string, size = 11, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, maxWidth);
    for (const row of lines) {
      if (y > 760) {
        doc.addPage();
        y = margin;
      }
      doc.text(row, margin, y);
      y += line;
    }
  };

  doc.setFillColor(41, 58, 78);
  doc.rect(0, 0, 595, 72, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(input.name, margin, 40);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("YVITY Verified Advisor Profile", margin, 58);

  y = 96;
  doc.setTextColor(30, 41, 59);
  addText(input.title, 13, true);
  addText(`${input.location}${input.companyName ? ` · ${input.companyName}` : ""}`, 10);
  if (input.phone.trim()) addText(`Phone: ${input.phone}`, 10);
  if (input.email.trim()) addText(`Email: ${input.email}`, 10);
  y += 6;
  if (input.heroBio.trim()) addText(input.heroBio, 10);
  y += 6;
  const ratingPart = input.rating != null ? `Rating ${input.rating}` : "Rating —";
  const clientsPart =
    input.profileHeroStat.value !== "—"
      ? `${input.profileHeroStat.value} ${input.profileHeroStat.label.toLowerCase()}`
      : "";
  const experiencePart = input.experienceDisplay
    ? `${input.experienceDisplay} experience`
    : "";
  addText([ratingPart, clientsPart, experiencePart].filter(Boolean).join(" · "), 10);
  y += 8;
  if (input.serviceLabels.length > 0) {
    addText("Services", 12, true);
    for (const label of input.serviceLabels) {
      addText(`• ${label}`, 10);
    }
    y += 8;
  }
  if (input.ctaDescription.trim()) addText(input.ctaDescription, 10);
  y += 12;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text(resolveProfileUrl(input), margin, 800);

  const filename = `${slugifyFilename(input.name || "advisor")}-yvity-profile.pdf`;
  doc.save(filename);
}

export async function downloadProfileQrCode(input: ProfileDownloadInput): Promise<void> {
  const QRCode = await import("qrcode");
  const url = resolveProfileUrl(input);
  const dataUrl = await QRCode.toDataURL(url, {
    width: 640,
    margin: 2,
    color: { dark: "#1e3a5f", light: "#ffffff" },
  });

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${slugifyFilename(input.name || "advisor")}-yvity-qr.png`;
  link.click();
}

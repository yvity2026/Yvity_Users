import { advisorProfile } from "@/lib/advisor-profile";

export function getPublicProfileUrl(origin?: string): string {
  const base =
    origin?.replace(/\/$/, "") ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/`;
}

function slugifyFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function downloadProfilePdf(): Promise<void> {
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
  doc.text(advisorProfile.name, margin, 40);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("YVITY Verified Advisor Profile", margin, 58);

  y = 96;
  doc.setTextColor(30, 41, 59);
  addText(advisorProfile.title, 13, true);
  addText(`${advisorProfile.location} · ${advisorProfile.companyName}`, 10);
  addText(`Phone: ${advisorProfile.phone}`, 10);
  addText(`Email: ${advisorProfile.email}`, 10);
  y += 6;
  addText(advisorProfile.home.heroBio, 10);
  y += 6;
  addText(
    `Rating ${advisorProfile.rating} · ${advisorProfile.clientsCount} clients · ${advisorProfile.experienceDisplay} experience`,
    10,
  );
  y += 8;
  addText("Services", 12, true);
  for (const chip of advisorProfile.home.serviceChips) {
    addText(`• ${chip.label}`, 10);
  }
  y += 8;
  addText(advisorProfile.ctaDescription, 10);
  y += 12;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text("Generated via YVITY — yvity.in", margin, 800);

  const filename = `${slugifyFilename(advisorProfile.name)}-yvity-profile.pdf`;
  doc.save(filename);
}

export async function downloadProfileQrCode(origin?: string): Promise<void> {
  const QRCode = await import("qrcode");
  const url = getPublicProfileUrl(origin);
  const dataUrl = await QRCode.toDataURL(url, {
    width: 640,
    margin: 2,
    color: { dark: "#1e3a5f", light: "#ffffff" },
  });

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${slugifyFilename(advisorProfile.name)}-yvity-qr.png`;
  link.click();
}

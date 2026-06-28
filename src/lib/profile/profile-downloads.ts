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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: number | [number, number, number, number],
): void {
  const [tl, tr, br, bl] =
    typeof radii === "number" ? [radii, radii, radii, radii] : radii;
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  ctx.lineTo(x + bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}

// ── QR Code card ──────────────────────────────────────────────────
export async function downloadProfileQrCode(input: ProfileDownloadInput): Promise<void> {
  const QRCode = await import("qrcode");
  const url = resolveProfileUrl(input);

  // High error correction lets the center logo cover ~30% without breaking scans
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 480,
    margin: 1,
    color: { dark: "#0A4A4A", light: "#ffffff" },
    errorCorrectionLevel: "H",
  });

  const W = 560;
  const HEADER_H = 148;
  const QR_PAD = 48;
  const QR_SIZE = W - QR_PAD * 2; // 464
  const FOOTER_H = 96;
  const H = HEADER_H + QR_PAD + QR_SIZE + QR_PAD + FOOTER_H;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ── Background ─────────────────────────────────────────────────
  ctx.fillStyle = "#F8F6F1";
  ctx.fillRect(0, 0, W, H);

  // ── Header ─────────────────────────────────────────────────────
  ctx.fillStyle = "#0A4A4A";
  roundedRect(ctx, 0, 0, W, HEADER_H, [24, 24, 0, 0]);
  ctx.fill();

  // Accent bottom strip on header
  ctx.fillStyle = "#2ab5b5";
  ctx.fillRect(0, HEADER_H - 4, W, 4);

  ctx.textAlign = "center";

  ctx.fillStyle = "#2ab5b5";
  ctx.font = "600 12px system-ui, -apple-system, sans-serif";
  ctx.fillText("SEE MY YVITY PROFILE", W / 2, 50);

  const displayName =
    input.name.length > 30 ? input.name.substring(0, 28) + "…" : input.name;
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${input.name.length > 22 ? "22" : "26"}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(displayName, W / 2, 90);

  if (input.title) {
    const displayTitle =
      input.title.length > 52 ? input.title.substring(0, 50) + "…" : input.title;
    ctx.fillStyle = "rgba(255,255,255,0.60)";
    ctx.font = "400 12px system-ui, -apple-system, sans-serif";
    ctx.fillText(displayTitle, W / 2, 118);
  }

  // ── QR white card with shadow ───────────────────────────────────
  const qrImg = await loadImage(qrDataUrl);
  const qrX = QR_PAD;
  const qrY = HEADER_H + QR_PAD;

  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(10,74,74,0.13)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 6;
  roundedRect(ctx, qrX - 16, qrY - 16, QR_SIZE + 32, QR_SIZE + 32, 16);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.drawImage(qrImg, qrX, qrY, QR_SIZE, QR_SIZE);

  // ── YVITY logo centered on QR ───────────────────────────────────
  const LOGO_SIZE = 70;
  const logoCX = W / 2;
  const logoCY = qrY + QR_SIZE / 2;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(logoCX, logoCY, LOGO_SIZE / 2 + 10, 0, Math.PI * 2);
  ctx.fill();

  try {
    const logoImg = await loadImage("/brand/yvity-logo.png");
    ctx.drawImage(logoImg, logoCX - LOGO_SIZE / 2, logoCY - LOGO_SIZE / 2, LOGO_SIZE, LOGO_SIZE);
  } catch {
    // Fallback: YVITY wordmark text
    ctx.fillStyle = "#0A4A4A";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("YVITY", logoCX, logoCY + 5);
  }

  // ── Footer ─────────────────────────────────────────────────────
  const footerTopY = qrY + QR_SIZE + QR_PAD;

  ctx.strokeStyle = "#E2DDD4";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(48, footerTopY);
  ctx.lineTo(W - 48, footerTopY);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "400 11px system-ui, -apple-system, sans-serif";
  ctx.fillText("Powered by YVITY  •  Scan to view advisor profile", W / 2, footerTopY + 32);

  // Bottom teal bar
  ctx.fillStyle = "#0A4A4A";
  roundedRect(ctx, 0, H - 5, W, 5, [0, 0, 24, 24]);
  ctx.fill();

  // ── Download ───────────────────────────────────────────────────
  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${slugifyFilename(input.name || "advisor")}-yvity-qr.png`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }
      resolve();
    }, "image/png");
  });
}

// ── PDF profile ───────────────────────────────────────────────────
export async function downloadProfilePdf(input: ProfileDownloadInput): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = 595;
  const margin = 48;
  const contentW = W - margin * 2;
  let y = 0;

  // ── Header band ─────────────────────────────────────────────────
  doc.setFillColor(10, 74, 74);
  doc.rect(0, 0, W, 88, "F");

  doc.setFillColor(42, 181, 181);
  doc.rect(0, 84, W, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(input.name, margin, 36);

  doc.setFontSize(9);
  doc.setTextColor(42, 181, 181);
  doc.setFont("helvetica", "bold");
  doc.text("YVITY VERIFIED ADVISOR PROFILE", margin, 54);

  const headerMeta = [input.title, input.location, input.companyName]
    .filter(Boolean)
    .join("  ·  ");
  if (headerMeta) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(headerMeta, margin, 72);
  }

  // ── Contact strip ────────────────────────────────────────────────
  doc.setFillColor(236, 246, 246);
  doc.rect(0, 88, W, 34, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(10, 74, 74);

  const contacts: string[] = [];
  if (input.phone.trim()) contacts.push(`Ph: ${input.phone}`);
  if (input.email.trim()) contacts.push(`Email: ${input.email}`);
  contacts.push(resolveProfileUrl(input));

  const contactSpacing = contentW / contacts.length;
  contacts.forEach((c, i) => {
    doc.text(c, margin + contactSpacing * i, 108);
  });

  // ── Stats row ────────────────────────────────────────────────────
  y = 140;
  const stats = [
    input.rating != null ? `Rating: ${input.rating} / 5` : null,
    input.experienceDisplay ? `Experience: ${input.experienceDisplay}` : null,
    input.profileHeroStat.value !== "—"
      ? `${input.profileHeroStat.label}: ${input.profileHeroStat.value}`
      : null,
  ].filter(Boolean) as string[];

  if (stats.length > 0) {
    doc.setFillColor(248, 246, 241);
    doc.rect(margin, y, contentW, 30, "F");
    doc.setDrawColor(10, 74, 74);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, contentW, 30, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(10, 74, 74);
    const statW = contentW / stats.length;
    stats.forEach((s, i) => {
      doc.text(s, margin + statW * i + 10, y + 19);
    });
    y += 46;
  }

  // ── Section helper ───────────────────────────────────────────────
  const addSection = (title: string) => {
    if (y > 760) { doc.addPage(); y = margin; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(10, 74, 74);
    doc.text(title, margin, y);
    doc.setDrawColor(42, 181, 181);
    doc.setLineWidth(1.5);
    doc.line(margin, y + 5, W - margin, y + 5);
    y += 22;
  };

  const addBody = (text: string, size = 10) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(text, contentW);
    for (const row of lines as string[]) {
      if (y > 800) { doc.addPage(); y = margin; }
      doc.text(row, margin, y);
      y += 15;
    }
  };

  // ── About ────────────────────────────────────────────────────────
  if (input.heroBio.trim()) {
    addSection("About");
    addBody(input.heroBio);
    y += 10;
  }

  // ── Services ─────────────────────────────────────────────────────
  if (input.serviceLabels.length > 0) {
    addSection("Services Offered");
    for (const label of input.serviceLabels) {
      addBody(`•  ${label}`);
    }
    y += 10;
  }

  // ── Why Work With Me ─────────────────────────────────────────────
  if (input.ctaDescription.trim()) {
    addSection("Why Work With Me");
    addBody(input.ctaDescription);
    y += 10;
  }

  // ── Footer bar ───────────────────────────────────────────────────
  const footerY = 824;
  doc.setFillColor(10, 74, 74);
  doc.rect(0, footerY, W, 18, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(42, 181, 181);
  doc.text("YVITY • Verified Advisor Platform", margin, footerY + 12);
  doc.setTextColor(255, 255, 255);
  doc.text(resolveProfileUrl(input), W - margin, footerY + 12, { align: "right" });

  doc.save(`${slugifyFilename(input.name || "advisor")}-yvity-profile.pdf`);
}

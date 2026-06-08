/**
 * Backfill approval notification + outbound log for Krishna Mohan (9705159705).
 * Run: node scripts/backfill-krishna-approval.mjs
 */
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ROOT = process.cwd();
const DATA = path.join(ROOT, ".data");
const KRISHNA_USER_ID = "167ec15f-6db6-4e57-8222-b437aa804b3b";

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA, file), "utf-8"));
  } catch {
    return fallback;
  }
}

async function writeJson(file, data) {
  await fs.mkdir(DATA, { recursive: true });
  await fs.writeFile(path.join(DATA, file), JSON.stringify(data, null, 2), "utf-8");
}

function profilePublicUrl(slug) {
  const display = slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
  return `http://localhost:3002/Advisor/${display}`;
}

async function main() {
  const profilesDb = await readJson("advisor-profiles.json", { profiles: {} });
  const profile = profilesDb.profiles[KRISHNA_USER_ID];
  if (!profile) {
    console.error("Profile not found");
    process.exit(1);
  }

  const regDb = await readJson("registration.json", { users: [] });
  const user = regDb.users.find((u) => u.id === KRISHNA_USER_ID);
  const advisorName = user?.fullName?.trim() || "Krishna Mohan Noti";
  const profileUrl = profilePublicUrl(profile.profile_slug);

  const notifDb = await readJson("notifications.json", { items: [] });
  const exists = notifDb.items.some(
    (n) => n.userId === KRISHNA_USER_ID && n.kind === "profile_approved",
  );

  if (!exists) {
    notifDb.items.unshift({
      id: randomUUID(),
      userId: KRISHNA_USER_ID,
      kind: "profile_approved",
      title: "Profile approved — you're live! 🎉",
      message: `Congratulations ${advisorName}! Your YVITY profile was verified and approved. Your public profile and YVITY Score are now fully active.`,
      href: "/dashboard",
      read: false,
      createdAt: new Date().toISOString(),
      meta: {
        profileSlug: profile.profile_slug,
        approvedAt: profile.approved_at ?? new Date().toISOString(),
      },
    });
    await writeJson("notifications.json", notifDb);
    console.log("Created in-app notification");
  } else {
    console.log("Notification already exists");
  }

  const outboundDb = await readJson("outbound-messages.json", { items: [] });
  const whatsappMessage = [
    "🎉 *Congratulations from YVITY!*",
    "",
    `Hi ${advisorName},`,
    "",
    "Your advisor profile has been *verified and approved* by our team.",
    "",
    "✅ Your public profile is now live",
    "✅ Clients can discover and trust you on YVITY",
    "✅ Your YVITY Score is fully active",
    "",
    `Approved on: ${profile.approved_at ?? "today"}`,
    "",
    `View your profile: ${profileUrl}`,
    "",
    "— Team YVITY",
    "Credibility that Connects",
  ].join("\n");

  if (user?.email?.trim()) {
    outboundDb.items.unshift({
      id: `out_${Date.now()}_email`,
      channel: "email",
      to: user.email.trim(),
      subject: "🎉 Your YVITY profile is approved — you're live!",
      preview: `Hi ${advisorName}, Great news — your YVITY advisor profile has been verified and approved.`,
      status: "logged",
      createdAt: new Date().toISOString(),
    });
    console.log("Logged email to", user.email);
  }

  if (user?.phone?.trim()) {
    const phone = user.phone.replace(/\D/g, "").length === 10 ? `91${user.phone.replace(/\D/g, "")}` : user.phone.replace(/\D/g, "");
    outboundDb.items.unshift({
      id: `out_${Date.now()}_wa`,
      channel: "whatsapp",
      to: phone,
      preview: whatsappMessage.slice(0, 180),
      status: "logged",
      createdAt: new Date().toISOString(),
    });
    console.log("Logged WhatsApp to", user.phone, `https://wa.me/${phone}`);
  }

  await writeJson("outbound-messages.json", outboundDb);
  console.log("Profile:", profile.account_status, "approved_at:", profile.approved_at);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

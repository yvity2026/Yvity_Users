/**
 * Backfill Yvity_Users `.data` JSON section files into Supabase.
 *
 * Run from repo root:
 *   node scripts/backfill-json-to-supabase.mjs
 *   node scripts/backfill-json-to-supabase.mjs --dry-run
 *   node scripts/backfill-json-to-supabase.mjs --user=167ec15f-6db6-4e57-8222-b437aa804b3b
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * Run `npm run seed:supabase` first if users/profiles/roles are not seeded yet.
 */
import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, ".data");
const DRY_RUN = process.argv.includes("--dry-run");
const USER_ARG = process.argv.find((a) => a.startsWith("--user="));
const ONLY_USER = USER_ARG ? USER_ARG.split("=")[1]?.trim() : null;

const META_MARKER = "\n---YVITY-META---\n";
const REC_META_TAG = "__yvity_meta__";

const SERVICE_TYPE = {
  life: "life insurance",
  health: "health insurance",
  general: "general insurance",
  mutual: "mutual funds",
};

const ACHIEVEMENT_TYPE = {
  life: "life",
  health: "health",
  education: "education",
  other: "other",
};

async function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  const raw = await fs.readFile(envPath, "utf-8");
  const env = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

async function readJson(filename, fallback) {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function embedGoldMeta(content, meta) {
  const quote = String(content ?? "").trim();
  if (!meta || !Object.keys(meta).length) return quote;
  return `${quote}${META_MARKER}${JSON.stringify(meta)}`;
}

function parseExperienceYears(item) {
  if (item.serviceStartDate) {
    const y = Number(String(item.serviceStartDate).slice(0, 4));
    if (!Number.isNaN(y) && y > 1900) return Math.max(0, new Date().getFullYear() - y);
  }
  const match = String(item.experience ?? "").match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

function mapSettingsToProfileColumns(settings) {
  if (!settings || typeof settings !== "object") {
    return { gold_settings: {}, patch: {} };
  }
  const visibility = settings.visibility ?? {};
  return {
    gold_settings: settings,
    patch: {
      ispublic_professional: visibility.careerJourney !== false,
      ispublic_services: visibility.individualServices !== false,
      ispublic_achievements: visibility.achievements !== false,
      ispublic_gallery: visibility.gallery !== false,
      ispublic_profile: settings.publicProfile?.profileActive !== false,
      show_contactdetails: settings.contact?.showMobileNumber !== false,
      intro_url: settings.introVideo?.url?.trim() || "",
      gold_settings: settings,
      updated_at: new Date().toISOString(),
    },
  };
}

function mapServiceRow(item, advisorId) {
  return {
    advisor_id: advisorId,
    service_type: SERVICE_TYPE[item.category] ?? item.title,
    company: item.provider,
    experience_years: parseExperienceYears(item),
    from_year: item.serviceStartDate?.slice(0, 10) ?? null,
    no_of_clients: item.clients || null,
    number_of_climes: item.claims || null,
    key_services: item.roleLabel ? [item.roleLabel] : [],
    short_summary: item.statusMessage || null,
    company_logo_url: item.companyLogoUrl || null,
  };
}

function mapAchievementRow(item, advisorId) {
  return {
    advisor_id: advisorId,
    title: item.title,
    organisation: item.subtitle || "—",
    description: item.description || "",
    achievement_year: item.years?.[0] || String(new Date().getFullYear()),
    type: ACHIEVEMENT_TYPE[item.category] ?? "other",
    icon: item.iconStyle || "trophy",
  };
}

function mapGalleryRow(item, advisorId, sortOrder) {
  const caption = [item.title, item.caption].filter(Boolean).join("\n").trim() || item.title;
  return {
    advisor_id: advisorId,
    image_url: item.imageUrl,
    caption,
    category: item.category || "events",
    sort_order: sortOrder,
  };
}

function mapTestimonialRow(item, advisorId) {
  const meta = {
    source: item.source ?? "customer",
    service: item.service,
    profession: item.profession,
    location: item.location,
    submittedAt: item.submittedAt,
    audioDuration: item.audioDuration,
    videoDuration: item.videoDuration,
  };
  const isAdvisor = item.source === "advisor";

  return {
    advisor_id: advisorId,
    name: item.name,
    mobile_number: isAdvisor ? "0000000000" : "9000000000",
    testimonial_type: item.type || "text",
    content: embedGoldMeta(item.quote, meta),
    media_url: item.mediaUrl ?? null,
    testimonial_rating: item.rating ?? 5,
    status: item.status === "draft" ? "pending" : "approved",
    is_mobile_verified: item.memberBadge === "mobile-verified" || Boolean(item.verified),
    is_verified: Boolean(item.verified),
    reply_text: item.advisorReply?.text ?? null,
    reply_created_at: item.advisorReply?.repliedOn ?? null,
    created_at: item.submittedAt || new Date().toISOString(),
  };
}

function mapExperienceRow(exp, userId) {
  const [fromYear] = String(exp.start || "").split("-");
  const toYear = exp.end ? String(exp.end).split("-")[0] : null;
  return {
    user_id: userId,
    entry_type: "Profession",
    title: exp.role,
    organisation: exp.company,
    service_category: exp.category,
    description: (exp.bullets || []).filter(Boolean).join("\n"),
    from_year: fromYear ? Number(fromYear) : null,
    to_year: toYear ? Number(toYear) : null,
    is_ongoing: !exp.end,
  };
}

function mapEducationRow(edu, userId) {
  const year = edu.year ? Number(String(edu.year).replace(/\D/g, "").slice(0, 4)) : null;
  return {
    user_id: userId,
    entry_type: "Education",
    title: edu.degree,
    degree_or_certificate: edu.degree,
    organisation: edu.institution,
    institution: edu.institution,
    description: edu.specialization || "",
    date: year,
    from_year: year,
  };
}

function mapCertificationRow(cert, userId) {
  const year = cert.year ? Number(String(cert.year).replace(/\D/g, "").slice(0, 4)) : null;
  return {
    user_id: userId,
    entry_type: "Certificate",
    title: cert.name,
    certificate_name: cert.name,
    organisation: cert.issuer,
    institution: cert.issuer,
    description: (cert.bullets || []).filter(Boolean).join("\n"),
    date: year,
    from_year: year,
  };
}

function mapLeadRow(lead, advisorId) {
  return {
    advisor_id: advisorId,
    name: lead.fullName,
    phone_number: lead.mobile,
    note: lead.notes || null,
    gold_meta: {
      origin: lead.origin,
      channel: lead.channel,
      city: lead.city ?? "",
      serviceType: lead.serviceType,
      priority: lead.priority,
      status: lead.status,
      notes: lead.notes,
      followUpType: lead.followUpType,
      followUpDate: lead.followUpDate,
      followUpTime: lead.followUpTime,
      lastActivityAt: lead.lastActivityAt,
      convertedAt: lead.convertedAt,
      message: lead.message,
      sourceInquiryId: lead.sourceInquiryId,
    },
    created_at: lead.createdAt,
    updated_at: lead.updatedAt,
  };
}

function mapRecommendationRow(rec, advisorId) {
  const tags = [...(rec.tags || [])];
  tags.push(
    `${REC_META_TAG}${JSON.stringify({
      fullName: rec.fullName,
      comment: rec.comment || rec.message,
    })}`,
  );

  return {
    advisor_id: advisorId,
    recommendations: tags,
    mobile_number: rec.mobileNormalised || String(rec.mobile || "").replace(/\D/g, "").slice(-10),
    is_mobile_verified: Boolean(rec.verified),
    status: "approved",
    created_at: rec.createdAt || new Date().toISOString(),
  };
}

async function perUserFile(userId, baseName, fallbackName, emptyFallback = []) {
  const specific = await readJson(`${baseName}-${userId}.json`, null);
  if (specific != null) return specific;
  if (fallbackName == null) return null;
  return readJson(fallbackName, emptyFallback);
}

async function clearAdvisorSections(supabase, advisorId) {
  const tables = [
    { table: "advisor_services", column: "advisor_id" },
    { table: "advisor_achievements", column: "advisor_id" },
    { table: "advisor_gallery", column: "advisor_id" },
    { table: "advisor_testimonials", column: "advisor_id" },
    { table: "advisor_journey", column: "user_id" },
    { table: "advisor_prospects", column: "advisor_id" },
    { table: "advisor_recommendations", column: "advisor_id" },
  ];

  for (const { table, column } of tables) {
    if (DRY_RUN) {
      console.log(`  [dry-run] delete from ${table} where ${column}=${advisorId}`);
      continue;
    }
    const { error } = await supabase.from(table).delete().eq(column, advisorId);
    if (error) throw new Error(`${table} delete: ${error.message}`);
  }
}

async function backfillAdvisor(supabase, advisorId) {
  console.log(`\nAdvisor ${advisorId}`);

  const services = (await perUserFile(advisorId, "services", "services.json")) ?? [];
  const achievements = (await perUserFile(advisorId, "achievements", "achievements.json")) ?? [];
  const gallery = (await perUserFile(advisorId, "gallery", "gallery.json")) ?? [];
  const testimonials = (await perUserFile(advisorId, "testimonials", "testimonials.json")) ?? [];
  const career = (await perUserFile(advisorId, "career", null)) ?? {
    experiences: [],
    certifications: [],
    education: [],
  };
  const settings =
    (await perUserFile(advisorId, "advisor-settings", "advisor-settings.json")) ?? {};

  const serviceRows = (Array.isArray(services) ? services : []).map((item) =>
    mapServiceRow(item, advisorId),
  );
  const achievementRows = (Array.isArray(achievements) ? achievements : []).map((item) =>
    mapAchievementRow(item, advisorId),
  );
  const galleryRows = (Array.isArray(gallery) ? gallery : [])
    .filter((item) => String(item.imageUrl || "").trim())
    .map((item, index) => mapGalleryRow(item, advisorId, index));
  const testimonialRows = (Array.isArray(testimonials) ? testimonials : []).map((item) =>
    mapTestimonialRow(item, advisorId),
  );
  const journeyRows = [
    ...(career.experiences || []).map((exp) => mapExperienceRow(exp, advisorId)),
    ...(career.certifications || []).map((cert) => mapCertificationRow(cert, advisorId)),
    ...(career.education || []).map((edu) => mapEducationRow(edu, advisorId)),
  ];

  const { patch: settingsPatch } = mapSettingsToProfileColumns(settings);

  console.log(
    `  services=${serviceRows.length} achievements=${achievementRows.length} gallery=${galleryRows.length} testimonials=${testimonialRows.length} journey=${journeyRows.length}`,
  );

  await clearAdvisorSections(supabase, advisorId);

  if (Object.keys(settingsPatch).length > 1) {
    if (DRY_RUN) {
      console.log("  [dry-run] update advisor_profiles settings");
    } else {
      const { error } = await supabase
        .from("advisor_profiles")
        .update(settingsPatch)
        .eq("advisor_id", advisorId);
      if (error) throw new Error(`advisor_profiles settings: ${error.message}`);
      console.log("  advisor_profiles settings: ok");
    }
  }

  const inserts = [
    { label: "advisor_services", rows: serviceRows },
    { label: "advisor_achievements", rows: achievementRows },
    { label: "advisor_gallery", rows: galleryRows },
    { label: "advisor_testimonials", rows: testimonialRows },
    { label: "advisor_journey", rows: journeyRows },
  ];

  for (const { label, rows } of inserts) {
    if (!rows.length) continue;
    if (DRY_RUN) {
      console.log(`  [dry-run] insert ${rows.length} → ${label}`);
      continue;
    }
    const { error } = await supabase.from(label).insert(rows);
    if (error) throw new Error(`${label} insert: ${error.message}`);
    console.log(`  ${label}: ${rows.length} rows`);
  }
}

async function backfillLeads(supabase, advisorIds) {
  const leads = await readJson("leads.json", []);
  if (!Array.isArray(leads) || leads.length === 0) {
    console.log("\nleads.json: empty — skipped");
    return;
  }

  // Workspace leads file is per logged-in advisor; assign to each advisor profile.
  for (const advisorId of advisorIds) {
    const rows = leads.map((lead) => mapLeadRow(lead, advisorId));
    if (DRY_RUN) {
      console.log(`\n[dry-run] insert ${rows.length} leads → advisor_prospects (${advisorId})`);
      continue;
    }
    const { error } = await supabase.from("advisor_prospects").insert(rows);
    if (error) throw new Error(`advisor_prospects insert: ${error.message}`);
    console.log(`\nadvisor_prospects: ${rows.length} rows (${advisorId})`);
  }
}

async function backfillRecommendations(supabase, advisorIds) {
  const recs = await readJson("recommendations.json", []);
  if (!Array.isArray(recs) || recs.length === 0) {
    console.log("\nrecommendations.json: missing/empty — skipped");
    return;
  }

  for (const advisorId of advisorIds) {
    const rows = recs.filter((r) => r.verified).map((rec) => mapRecommendationRow(rec, advisorId));
    if (!rows.length) continue;
    if (DRY_RUN) {
      console.log(`[dry-run] insert ${rows.length} recommendations (${advisorId})`);
      continue;
    }
    const { error } = await supabase.from("advisor_recommendations").insert(rows);
    if (error) throw new Error(`advisor_recommendations insert: ${error.message}`);
    console.log(`advisor_recommendations: ${rows.length} rows (${advisorId})`);
  }
}

async function resolveProfileUuid(supabase, advisorUserId, rawProfileId) {
  if (/^[0-9a-f-]{36}$/i.test(rawProfileId)) {
    const byId = await supabase
      .from("advisor_profiles")
      .select("id")
      .eq("id", rawProfileId)
      .maybeSingle();
    if (byId.data?.id) return byId.data.id;
  }

  const byUser = await supabase
    .from("advisor_profiles")
    .select("id")
    .eq("advisor_id", rawProfileId || advisorUserId)
    .maybeSingle();
  return byUser.data?.id ?? null;
}

async function backfillTelemetry(supabase, advisorUserId) {
  console.log(`\nTelemetry for ${advisorUserId}`);

  const notificationsDb = await readJson("notifications.json", { items: [] });
  const notifications = Array.isArray(notificationsDb.items) ? notificationsDb.items : [];
  const contactInquiries = await readJson("contact-inquiries.json", []);
  const scoreActivity = await readJson("score-activity.json", { profileViews: [], loginDays: [] });
  const scoreDecay = await readJson("score-decay.json", []);
  const savedDb = await readJson("saved-profiles.json", { entries: [] });
  const savedEntries = Array.isArray(savedDb.entries) ? savedDb.entries : [];

  if (!DRY_RUN) {
    await supabase.from("advisor_notifications").delete().eq("user_id", advisorUserId);
    await supabase.from("contact_inquiries").delete().eq("advisor_id", advisorUserId);
    await supabase.from("advisor_profile_views").delete().eq("advisor_id", advisorUserId);
    await supabase.from("advisor_login_activity").delete().eq("advisor_id", advisorUserId);
    await supabase.from("advisor_score_decay_ledger").delete().eq("advisor_id", advisorUserId);
    await supabase.from("saved_profiles").delete().eq("user_id", advisorUserId);
  }

  const notifRows = notifications
    .filter((n) => n.userId === advisorUserId)
    .map((n) => ({
      user_id: n.userId,
      kind: n.kind,
      title: n.title,
      message: n.message,
      href: n.href ?? null,
      read: Boolean(n.read),
      meta: n.meta ?? {},
      created_at: n.createdAt,
    }));

  const inquiryRows = (Array.isArray(contactInquiries) ? contactInquiries : []).map((inq) => ({
    advisor_id: advisorUserId,
    full_name: inq.fullName,
    mobile: inq.mobile,
    interests: inq.interests ?? [],
    message: inq.message ?? null,
    created_at: inq.createdAt,
  }));

  const viewRows = (scoreActivity.profileViews ?? [])
    .filter((v) => v.advisorUserId === advisorUserId)
    .map((v) => ({
      advisor_id: advisorUserId,
      viewer_key: v.viewerKey,
      viewed_at: v.viewedAt,
    }));

  const loginRows = (scoreActivity.loginDays ?? [])
    .filter((d) => d.userId === advisorUserId)
    .map((d) => ({
      advisor_id: advisorUserId,
      login_date: d.date,
    }));

  const decayRow = (Array.isArray(scoreDecay) ? scoreDecay : []).find(
    (r) => r.advisorUserId === advisorUserId,
  );

  const savedRows = [];
  for (const entry of savedEntries.filter((e) => e.userId === advisorUserId)) {
    const profileId = await resolveProfileUuid(supabase, advisorUserId, entry.advisorProfileId);
    if (!profileId) continue;
    savedRows.push({
      user_id: entry.userId,
      advisor_profile_id: profileId,
      created_at: new Date(entry.createdAt).toISOString(),
    });
  }

  const inserts = [
    ["advisor_notifications", notifRows],
    ["contact_inquiries", inquiryRows],
    ["advisor_profile_views", viewRows],
    ["advisor_login_activity", loginRows],
    ["saved_profiles", savedRows],
  ];

  for (const [table, rows] of inserts) {
    if (!rows.length) continue;
    if (DRY_RUN) {
      console.log(`  [dry-run] insert ${rows.length} → ${table}`);
      continue;
    }
    const { error } = await supabase.from(table).insert(rows);
    if (error) throw new Error(`${table} insert: ${error.message}`);
    console.log(`  ${table}: ${rows.length} rows`);
  }

  if (decayRow) {
    const row = {
      advisor_id: advisorUserId,
      profile_views_decay: decayRow.profileViewsDecay ?? 0,
      self_share_decay: decayRow.selfShareDecay ?? 0,
      client_share_decay: decayRow.clientShareDecay ?? 0,
      login_decay: decayRow.loginDecay ?? 0,
      last_evaluated_month: decayRow.lastEvaluatedMonth ?? null,
    };
    if (DRY_RUN) {
      console.log("  [dry-run] upsert advisor_score_decay_ledger");
    } else {
      const { error } = await supabase
        .from("advisor_score_decay_ledger")
        .upsert(row, { onConflict: "advisor_id" });
      if (error) throw new Error(`advisor_score_decay_ledger upsert: ${error.message}`);
      console.log("  advisor_score_decay_ledger: ok");
    }
  }
}

async function printCounts(supabase) {
  const tables = [
    "advisor_services",
    "advisor_achievements",
    "advisor_gallery",
    "advisor_testimonials",
    "advisor_journey",
    "advisor_prospects",
    "advisor_recommendations",
    "advisor_notifications",
    "contact_inquiries",
    "advisor_profile_views",
    "advisor_login_activity",
    "saved_profiles",
  ];

  console.log("\nSupabase row counts:");
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
    if (error) {
      console.log(`  ${table}: error (${error.message})`);
    } else {
      console.log(`  ${table}: ${count ?? 0}`);
    }
  }
}

async function main() {
  const env = await loadEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const profilesDb = await readJson("advisor-profiles.json", { profiles: {} });
  let advisorIds = Object.keys(profilesDb.profiles ?? {});
  if (ONLY_USER) {
    advisorIds = advisorIds.filter((id) => id === ONLY_USER);
    if (!advisorIds.length) {
      console.error(`No advisor profile found for user ${ONLY_USER}`);
      process.exit(1);
    }
  }

  if (advisorIds.length === 0) {
    console.error("No advisor profiles in .data/advisor-profiles.json — run seed:supabase first");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`Target: ${url}`);
  console.log(`Advisors to backfill: ${advisorIds.length}`);
  if (DRY_RUN) console.log("DRY RUN — no writes");

  for (const advisorId of advisorIds) {
    await backfillAdvisor(supabase, advisorId);
  }

  // Leads/recommendations cleared inside backfillAdvisor; re-insert once for primary advisor only
  // to avoid duplicating global workspace files across every profile.
  const primaryAdvisorId = advisorIds[0];
  if (!DRY_RUN) {
    await supabase.from("advisor_prospects").delete().eq("advisor_id", primaryAdvisorId);
    await supabase.from("advisor_recommendations").delete().eq("advisor_id", primaryAdvisorId);
  }
  await backfillLeads(supabase, [primaryAdvisorId]);
  await backfillRecommendations(supabase, [primaryAdvisorId]);
  await backfillTelemetry(supabase, primaryAdvisorId);

  if (!DRY_RUN) {
    await printCounts(supabase);
    console.log("\nBackfill complete.");
  } else {
    console.log("\nDry run complete.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

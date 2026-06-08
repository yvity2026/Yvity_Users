import { NextResponse } from "next/server";
import { visibleLeads } from "@/lib/advisor-membership/plan-enforcement";
import { getAdvisorPlanContext } from "@/lib/advisor-membership/plan-enforcement-server";
import { LEAD_SERVICE_TYPES } from "@/lib/leads/service-types";
import type { CreateLeadInput, LeadPriority, SelfLeadChannel } from "@/lib/leads/types";
import { LEAD_PRIORITIES, SELF_LEAD_SOURCES } from "@/lib/leads/config";
import { unauthorized, requireSession } from "@/lib/server/api-auth";
import { createLead, listLeadsWithSync } from "@/lib/server/leads-persistence";

const validChannels = new Set(SELF_LEAD_SOURCES.map((c) => c.id));
const validServices = new Set(LEAD_SERVICE_TYPES.map((s) => s.id));
const validPriorities = new Set(LEAD_PRIORITIES.map((p) => p.id));

export async function GET() {
  const user = await requireSession();
  if (!user?.id) return unauthorized();

  const data = await listLeadsWithSync(user.id);
  const sorted = [...data].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const planCtx = await getAdvisorPlanContext(user.id);
  if (!planCtx) {
    return NextResponse.json({ data: sorted, meta: { total: sorted.length, visible: sorted.length, lockedCount: 0, limit: null } });
  }

  const { visible, total, lockedCount, limit } = visibleLeads(planCtx.limits, sorted);
  return NextResponse.json({ data: visible, meta: { total, visible: visible.length, lockedCount, limit } });
}

export async function POST(request: Request) {
  const user = await requireSession();
  if (!user?.id) return unauthorized();

  let body: {
    fullName?: string;
    mobile?: string;
    city?: string;
    channel?: string;
    serviceType?: string;
    priority?: string;
    notes?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const fullName = body.fullName?.trim() ?? "";
  const mobile = body.mobile?.trim() ?? "";
  const channel = body.channel as SelfLeadChannel;
  const serviceType = body.serviceType as CreateLeadInput["serviceType"];
  const priority = (body.priority ?? "medium") as LeadPriority;

  if (fullName.length < 2) {
    return NextResponse.json({ error: "Please enter the lead name" }, { status: 400 });
  }

  const digits = mobile.replace(/\D/g, "");
  if (digits.length < 10) {
    return NextResponse.json({ error: "Please enter a valid mobile number" }, { status: 400 });
  }

  if (!validChannels.has(channel)) {
    return NextResponse.json({ error: "Select Referral or Manual Entry" }, { status: 400 });
  }

  if (!validServices.has(serviceType)) {
    return NextResponse.json({ error: "Please select a service type" }, { status: 400 });
  }

  if (!validPriorities.has(priority)) {
    return NextResponse.json({ error: "Please select priority" }, { status: 400 });
  }

  const input: CreateLeadInput = {
    fullName,
    mobile,
    city: body.city?.trim(),
    channel,
    serviceType,
    priority,
    notes: body.notes?.trim(),
  };

  try {
    const lead = await createLead(user.id, input);
    return NextResponse.json({ data: lead });
  } catch (err) {
    console.error("[leads POST]", err);
    return NextResponse.json({ error: "Could not save lead. Please try again." }, { status: 500 });
  }
}

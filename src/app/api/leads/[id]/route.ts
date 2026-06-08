import { NextResponse } from "next/server";
import { LEAD_SERVICE_TYPES } from "@/lib/leads/service-types";
import type {
  FollowUpType,
  LeadPriority,
  LeadStatus,
  SelfLeadChannel,
  UpdateLeadInput,
} from "@/lib/leads/types";
import {
  FOLLOW_UP_TYPES,
  LEAD_PRIORITIES,
  LEAD_STATUSES,
  SELF_LEAD_SOURCES,
} from "@/lib/leads/config";
import { unauthorized, requireSession } from "@/lib/server/api-auth";
import { deleteLead, updateLead } from "@/lib/server/leads-persistence";

const validStatuses = new Set(LEAD_STATUSES.map((s) => s.id));
const validServices = new Set(LEAD_SERVICE_TYPES.map((s) => s.id));
const validPriorities = new Set(LEAD_PRIORITIES.map((p) => p.id));
const validChannels = new Set(SELF_LEAD_SOURCES.map((c) => c.id));
const validFollowUpTypes = new Set(FOLLOW_UP_TYPES.map((f) => f.id));

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: RouteCtx) {
  const user = await requireSession();
  if (!user?.id) return unauthorized();

  const { id } = await ctx.params;

  let body: UpdateLeadInput;
  try {
    body = (await request.json()) as UpdateLeadInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.status && !validStatuses.has(body.status as LeadStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (body.serviceType && !validServices.has(body.serviceType)) {
    return NextResponse.json({ error: "Invalid service type" }, { status: 400 });
  }

  if (body.priority && !validPriorities.has(body.priority)) {
    return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
  }

  if (body.channel && !validChannels.has(body.channel as SelfLeadChannel)) {
    return NextResponse.json({ error: "Invalid lead source" }, { status: 400 });
  }

  if (
    body.followUpType &&
    body.followUpType !== null &&
    !validFollowUpTypes.has(body.followUpType as FollowUpType)
  ) {
    return NextResponse.json({ error: "Invalid follow-up type" }, { status: 400 });
  }

  const updated = await updateLead(user.id, id, body);
  if (!updated) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_request: Request, ctx: RouteCtx) {
  const user = await requireSession();
  if (!user?.id) return unauthorized();

  const { id } = await ctx.params;
  const ok = await deleteLead(user.id, id);
  if (!ok) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}

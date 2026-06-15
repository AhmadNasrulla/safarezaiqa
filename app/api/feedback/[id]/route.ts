import { NextRequest, NextResponse } from "next/server";
import { deleteFeedback, updateFeedbackStatus, FEEDBACK_STATUSES } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function requireAdmin() {
  const me = await getCurrentUser();
  return me && me.role === "admin" ? me : null;
}

// Admin only: move a review through the triage workflow.
export async function PATCH(request: NextRequest, { params }: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const id = Number((await params).id);
  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.status || !FEEDBACK_STATUSES.includes(body.status as (typeof FEEDBACK_STATUSES)[number])) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  const ok = await updateFeedbackStatus(id, body.status);
  if (!ok) return NextResponse.json({ error: "Feedback not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// Admin only: permanently remove a review.
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const id = Number((await params).id);
  const ok = await deleteFeedback(id);
  if (!ok) return NextResponse.json({ error: "Feedback not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

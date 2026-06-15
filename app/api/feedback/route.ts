import { NextRequest, NextResponse } from "next/server";
import { createFeedback, listFeedback } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

const MAX_MESSAGE = 1000;

// Public: anyone can leave feedback. If the visitor is logged in we trust the
// session for their identity (so it can't be spoofed); otherwise we accept an
// optional display name. The offline Zaiqa Sense analysis runs inside
// createFeedback, so nothing here touches the network.
export async function POST(request: NextRequest) {
  let body: { rating?: number; message?: string; name?: string; order_id?: number; pillars?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const rating = Number(body.rating) || 0;
  const message = (body.message ?? "").toString().trim().slice(0, MAX_MESSAGE);
  const pillars = Array.isArray(body.pillars) ? body.pillars.map(String) : [];

  if ((rating < 1 || rating > 5) && message.length < 2) {
    return NextResponse.json(
      { error: "Please give a star rating or a short comment." },
      { status: 400 },
    );
  }

  const me = await getCurrentUser();
  const feedback = await createFeedback({
    user_id: me?.id ?? null,
    customer_name: me?.name ?? (body.name ?? "").toString().trim() ?? "Guest",
    email: me?.email ?? "",
    order_id: typeof body.order_id === "number" ? body.order_id : null,
    rating: rating >= 1 && rating <= 5 ? rating : 0,
    message,
    pillars,
  });

  // Echo the model's read so the client can optionally acknowledge it.
  let analysis: unknown = null;
  try {
    analysis = JSON.parse(feedback.analysis_json);
  } catch {
    analysis = null;
  }
  return NextResponse.json({ id: feedback.id, analysis });
}

// Admin only: the full review feed for the dashboard.
export async function GET() {
  const me = await getCurrentUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json({ feedback: await listFeedback() });
}

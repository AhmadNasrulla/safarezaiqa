import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const STATUSES = ["new", "preparing", "ready", "completed", "cancelled"];

export async function PATCH(request: NextRequest, { params }: Ctx) {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const id = Number((await params).id);
  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.status || !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  const ok = updateOrderStatus(id, body.status);
  if (!ok) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

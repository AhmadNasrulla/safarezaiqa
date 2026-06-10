import { NextRequest, NextResponse } from "next/server";
import { createOrder, listOrders } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

type IncomingItem = { name: string; price: number; qty: number };

// Customers must be logged in with a complete profile (phone + address) to
// place an order. Identity & contact details come from the session, not the
// client, so they can't be spoofed.
export async function POST(request: NextRequest) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json(
      { error: "Please log in to place an order.", code: "AUTH_REQUIRED" },
      { status: 401 },
    );
  }
  if (!me.phone?.trim() || !me.address?.trim()) {
    return NextResponse.json(
      { error: "Add your phone number and address before ordering.", code: "PROFILE_INCOMPLETE" },
      { status: 400 },
    );
  }

  let body: { items?: IncomingItem[]; total?: number; note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }
  const total =
    typeof body.total === "number"
      ? body.total
      : body.items.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);

  const order = createOrder({
    customer_name: me.name,
    phone: me.phone,
    address: me.address,
    items: body.items,
    total,
    note: body.note?.trim() ?? "",
  });
  return NextResponse.json({ id: order.id, total: order.total });
}

// Admin only: list recent orders.
export async function GET() {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json({ orders: listOrders() });
}

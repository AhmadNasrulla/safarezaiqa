import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/app/lib/db";
import { hashPassword, startSession } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

// Customer self-registration (role = customer). Phone & address are captured
// up front so the customer can order immediately.
export async function POST(request: NextRequest) {
  let body: { name?: string; email?: string; password?: string; phone?: string; address?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const phone = body.phone?.trim() ?? "";
  const address = body.address?.trim() ?? "";

  if (!name || !email || !email.includes("@") || password.length < 6) {
    return NextResponse.json(
      { error: "Provide a name, a valid email, and a password of at least 6 characters." },
      { status: 400 },
    );
  }
  if (!phone || !address) {
    return NextResponse.json(
      { error: "Phone number and delivery address are required to place orders." },
      { status: 400 },
    );
  }
  if (await getUserByEmail(email)) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const user = await createUser({
    name,
    email,
    password_hash: hashPassword(password),
    role: "customer",
    phone,
    address,
  });
  await startSession(user.id);
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, phone, address },
  });
}

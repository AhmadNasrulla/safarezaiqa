import { NextRequest, NextResponse } from "next/server";
import { updateUserProfile } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

// Update the logged-in user's name / phone / address.
export async function PUT(request: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  let body: { name?: string; phone?: string; address?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const phone = body.phone?.trim();
  const address = body.address?.trim();
  if (phone === "" || address === "") {
    return NextResponse.json({ error: "Phone and address cannot be empty." }, { status: 400 });
  }

  const updated = updateUserProfile(me.id, {
    name: body.name?.trim(),
    phone,
    address,
  });
  if (!updated) return NextResponse.json({ error: "Could not update profile." }, { status: 400 });

  return NextResponse.json({
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone,
      address: updated.address,
    },
  });
}

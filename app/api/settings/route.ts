import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings, type Settings } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

// Public: customer site needs location, hours, status and contact.
export async function GET() {
  return NextResponse.json({ settings: await getSettings() });
}

// Admin only: update location / contact / status.
export async function PUT(request: NextRequest) {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  let body: Partial<Settings>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const allowed: (keyof Settings)[] = [
    "truck_label",
    "address",
    "truck_lat",
    "truck_lng",
    "maps_url",
    "whatsapp_number",
    "truck_status",
    "hours",
  ];
  const patch: Partial<Settings> = {};
  for (const key of allowed) {
    if (typeof body[key] === "string") patch[key] = body[key] as string;
  }
  await updateSettings(patch);
  return NextResponse.json({ settings: await getSettings() });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

// Returns the currently logged-in user (or null) for the customer site.
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

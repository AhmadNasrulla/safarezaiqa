import { NextRequest, NextResponse } from "next/server";
import { updateProduct, deleteProduct } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Ctx) {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const id = Number((await params).id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const updated = await updateProduct(id, {
    category: typeof body.category === "string" ? body.category : undefined,
    name: typeof body.name === "string" ? body.name : undefined,
    description: typeof body.description === "string" ? body.description : undefined,
    price: typeof body.price === "number" ? body.price : undefined,
    image: typeof body.image === "string" ? body.image : undefined,
    available: typeof body.available === "boolean" ? body.available : undefined,
  });
  if (!updated) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ product: updated });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const id = Number((await params).id);
  const ok = await deleteProduct(id);
  if (!ok) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { listProducts, createProduct } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

// Public: list products (prices are public). `?available=1` limits to in-stock.
export async function GET(request: NextRequest) {
  const onlyAvailable = request.nextUrl.searchParams.get("available") === "1";
  return NextResponse.json({ products: listProducts({ onlyAvailable }) });
}

// Admin only: create a product.
export async function POST(request: NextRequest) {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  let body: { category?: string; name?: string; description?: string; price?: number; available?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.category?.trim() || !body.name?.trim() || body.price == null || body.price < 0) {
    return NextResponse.json({ error: "Category, name and a valid price are required." }, { status: 400 });
  }
  const product = createProduct({
    category: body.category.trim(),
    name: body.name.trim(),
    description: body.description?.trim() ?? "",
    price: Number(body.price),
    available: body.available,
  });
  return NextResponse.json({ product });
}

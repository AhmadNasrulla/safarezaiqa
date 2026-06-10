import { listProducts, getSettings } from "@/app/lib/db";
import { CustomerApp } from "@/app/components/customer/CustomerApp";

// Reads from the local DB on each request so menu/location edits show instantly.
export const dynamic = "force-dynamic";

export default function Home() {
  // node:sqlite returns null-prototype rows; spread into plain objects so they
  // can cross the Server → Client component boundary.
  const products = listProducts({ onlyAvailable: true }).map((p) => ({ ...p }));
  const settings = { ...getSettings() };
  return <CustomerApp products={products} settings={settings} />;
}

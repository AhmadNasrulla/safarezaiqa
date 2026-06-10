import { listProducts, getSettings } from "@/app/lib/db";
import { CustomerApp } from "@/app/components/customer/CustomerApp";

// Reads from the local DB on each request so menu/location edits show instantly.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, settings] = await Promise.all([
    listProducts({ onlyAvailable: true }),
    getSettings(),
  ]);
  return <CustomerApp products={products} settings={settings} />;
}

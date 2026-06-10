import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth";
import { Dashboard } from "@/app/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "admin") redirect("/"); // customers can't access the admin area
  return <Dashboard user={user} />;
}

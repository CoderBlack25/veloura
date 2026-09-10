import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { AdminSignOutButton } from "@/components/admin-sign-out-button";

const NAV = [
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/inventory", label: "Inventory" },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The actual authentication boundary (TRD Section 6.2) — proxy.ts only
  // checked that *a* cookie exists; this is the database-backed check that
  // the session is real and still valid.
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-cream-soft">
      <div className="border-b border-beige-main bg-cream-light">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link
              href="/admin/orders"
              className="font-display text-lg text-brown-dark"
            >
              Veloura <span className="text-green-main">Staff</span>
            </Link>
            <nav className="flex items-center gap-5">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-brown-main hover:text-brown-dark"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-main">{session.user.email}</span>
            <AdminSignOutButton />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

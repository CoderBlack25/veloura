import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin-login-form";

export const metadata = { title: "Staff sign in" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-green-main">
          Veloura staff
        </p>
        <h1 className="font-display text-2xl text-brown-dark">Sign in</h1>
        <p className="mt-1 mb-6 text-sm text-gray-main">
          Internal access only. Accounts are created directly — there&apos;s no
          public sign-up.
        </p>
        <Suspense>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}

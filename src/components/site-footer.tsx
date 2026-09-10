import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/shipping-returns", label: "Shipping & Returns" },
  { href: "/contact", label: "Contact" },
  { href: "/orders/lookup", label: "Track an order" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-beige-main/70 bg-cream-muted">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-lg text-brown-dark">Veloura</p>
            <p className="mt-2 text-sm text-gray-main">
              Plant-based, fragrance-free baby wipes — 99% water, ingredients
              you can actually read.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-1">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-brown-main hover:text-brown-dark"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-10 text-xs text-gray-main">
          © {new Date().getFullYear()} Veloura. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

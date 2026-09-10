import Link from "next/link";
import { CartSheet } from "@/components/cart-sheet";

const NAV_LINKS = [
  { href: "/products/baby-wipes", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-beige-main/70 bg-cream-light/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-brown-dark"
        >
          Veloura
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-brown-main transition-colors hover:text-brown-dark"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <CartSheet />
      </div>
    </header>
  );
}

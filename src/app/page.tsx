import Link from "next/link";
import { Droplets, Leaf, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const TRUST_POINTS = [
  {
    icon: Droplets,
    title: "99% water",
    body: "The simplest formulation we could make without losing what a wipe actually needs to do.",
  },
  {
    icon: Leaf,
    title: "Fragrance-free by default",
    body: "No added fragrance, alcohol, or parabens — full ingredient list on every product page.",
  },
  {
    icon: PackageCheck,
    title: "Dermatologically tested",
    body: "Safe from birth, tested on sensitive skin before anything ships.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-green-main">
            Gentle by nature
          </p>
          <h1 className="font-display text-4xl leading-[1.1] text-brown-dark sm:text-5xl">
            Baby wipes with nothing to hide.
          </h1>
          <p className="mt-5 max-w-lg text-base text-gray-main sm:text-lg">
            99% water, plant-derived ingredients, and a full ingredient list on
            every page — not buried in size-6 font on the back of the pack.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/products/baby-wipes">Shop wipes</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/about">Our story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="border-y border-beige-main/70 bg-cream-muted">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-3 sm:px-6">
          {TRUST_POINTS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-green-main/15">
                <Icon className="size-5 text-green-main" />
              </div>
              <h3 className="font-display text-lg text-brown-dark">{title}</h3>
              <p className="text-sm text-gray-main">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <h2 className="font-display text-2xl text-brown-dark sm:text-3xl">
          Two formulations. Three pack sizes. One standard for what goes on your
          baby&apos;s skin.
        </h2>
        <div className="mt-6">
          <Button asChild size="lg">
            <Link href="/products/baby-wipes">See ingredients & pricing</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

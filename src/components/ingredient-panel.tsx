import { Leaf } from "lucide-react";

const INGREDIENTS = [
  { name: "Purified Water (Aqua)", note: "99% of every wipe" },
  { name: "Citric Acid", note: "Natural pH balancer" },
  { name: "Sodium Benzoate", note: "Plant-derived preservative" },
  { name: "Panthenol (Pro-Vitamin B5)", note: "Skin conditioning" },
  { name: "Chamomilla Recutita Extract", note: "Aloe & Chamomile only" },
  { name: "Aloe Barbadensis Leaf Extract", note: "Aloe & Chamomile only" },
];

export function IngredientPanel() {
  return (
    <section className="rounded-2xl border border-beige-main bg-cream-soft p-6 sm:p-8">
      <div className="mb-5 flex items-center gap-2">
        <Leaf className="size-5 text-green-main" />
        <h2 className="font-display text-xl text-brown-dark">
          Every ingredient, no exceptions
        </h2>
      </div>
      <p className="mb-6 max-w-2xl text-sm text-gray-main">
        This is the full list — not a highlight reel. If a wipe touches your
        baby&apos;s skin, you should be able to read exactly what&apos;s in it
        without digging through a PDF.
      </p>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        {INGREDIENTS.map((ingredient) => (
          <div
            key={ingredient.name}
            className="flex items-baseline justify-between gap-3 border-b border-beige-main/60 pb-2"
          >
            <dt className="text-sm text-brown-dark">{ingredient.name}</dt>
            <dd className="shrink-0 text-xs text-gray-main">
              {ingredient.note}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

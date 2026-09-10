/**
 * TRD Section 4.4 draws a firm line between commerce data (Postgres) and
 * content data (CMS). This file is a placeholder for that CMS layer so the
 * scaffold has real, on-brand copy to render without requiring a live
 * Sanity/Payload project to be provisioned first.
 *
 * To wire up the real CMS: replace each export below with a fetch call
 * (e.g. `sanityClient.fetch(...)`) that returns the same shape, and these
 * page components don't need to change at all.
 */

export const faqItems = [
  {
    question: "What's actually in Veloura wipes?",
    answer:
      "99% water, plus a short, plant-derived ingredient list you can read in full on the product page — no fragrance, no alcohol, no parabens. We list every ingredient, not just the marketing highlights.",
  },
  {
    question:
      "What's the difference between Fragrance-Free and Aloe & Chamomile?",
    answer:
      "Fragrance-Free is our simplest formulation for the most sensitive skin. Aloe & Chamomile adds two calming plant extracts and a very light, natural scent — both are dermatologically tested and safe from birth.",
  },
  {
    question: "Which pack size should I get?",
    answer:
      "Single packs are great for a diaper bag or trying us out. The 3-Pack covers most families for about a month. The 6-Pack is our best per-wipe value for regular use.",
  },
  {
    question: "Are the wipes biodegradable?",
    answer:
      "The wipe cloth is plant-fiber based and breaks down significantly faster than standard polyester wipes. Full packaging materials and recyclability details are on each pack.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Orders ship within 1–2 business days. You'll get a tracking link by email the moment your order leaves our fulfillment partner.",
  },
  {
    question: "What if my baby reacts to the wipes?",
    answer:
      "Stop use and contact us at hello@veloura.com — we'll help you sort out a return or exchange, no hoops to jump through.",
  },
] as const;

export const aboutContent = {
  heroTitle: "Gentle by nature, honest by design",
  heroBody:
    "Veloura started with one question: why is it so hard to know what's actually on a baby's skin? Most wipes lead with a photo of a smiling infant and bury the ingredient list on the back in size-6 font. We decided to build the opposite kind of brand — one where the ingredients are the headline.",
  sections: [
    {
      title: "What's in the pack",
      body: "Every Veloura wipe starts with 99% purified water. What's left is a short list of plant-derived, dermatologically tested ingredients — nothing you can't pronounce, nothing added just to make the pack smell like a candle aisle.",
    },
    {
      title: "How we source",
      body: "We work with a single European manufacturing partner who shares our stance on fragrance-free formulation and responsible fiber sourcing, rather than spreading production across whoever is cheapest that quarter.",
    },
    {
      title: "Where we're headed",
      body: "Wipes are the first product, not the only one. We're building Veloura as a small, focused line of essentials — judged by whether we'd feel completely comfortable using them ourselves, not by how fast we can add SKUs.",
    },
  ],
} as const;

export const shippingReturnsContent = {
  shipping: [
    {
      label: "Processing time",
      value: "1–2 business days before your order ships.",
    },
    {
      label: "Delivery estimate",
      value: "2–5 business days after dispatch, depending on destination.",
    },
    {
      label: "Tracking",
      value: "Emailed automatically the moment your order is marked shipped.",
    },
  ],
  returns: [
    "If a pack arrives damaged or isn't right for your baby's skin, email hello@veloura.com within 30 days of delivery with your order number.",
    "We'll send a prepaid return label for unopened packs, or simply issue a refund for opened packs affected by a reaction — we're not going to make a new parent mail back used wipes.",
    "Refunds are issued to the original payment method within 5–10 business days of approval.",
  ],
} as const;

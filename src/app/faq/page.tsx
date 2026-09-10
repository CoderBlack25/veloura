import { faqItems } from "@/lib/content";

export const metadata = { title: "FAQ" };

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-green-main">
        FAQ
      </p>
      <h1 className="font-display text-4xl text-brown-dark">
        Common questions
      </h1>

      <div className="mt-12 flex flex-col divide-y divide-beige-main">
        {faqItems.map((item) => (
          <details key={item.question} className="group py-5 first:pt-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-brown-dark marker:content-none">
              {item.question}
              <span className="shrink-0 text-green-main transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-gray-main">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}

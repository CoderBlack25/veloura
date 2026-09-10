import { aboutContent } from "@/lib/content";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-green-main">
        About
      </p>
      <h1 className="font-display text-4xl text-brown-dark">
        {aboutContent.heroTitle}
      </h1>
      <p className="mt-5 text-lg text-gray-main">{aboutContent.heroBody}</p>

      <div className="mt-14 flex flex-col gap-10">
        {aboutContent.sections.map((section) => (
          <div key={section.title}>
            <h2 className="font-display text-2xl text-brown-dark">
              {section.title}
            </h2>
            <p className="mt-3 text-gray-main">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

import { ContactForm } from "@/components/contact-form";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-green-main">
        Contact
      </p>
      <h1 className="font-display text-4xl text-brown-dark">Get in touch</h1>
      <p className="mt-3 text-gray-main">
        Questions about an order, a reaction, or anything else — we read every
        message.
      </p>
      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}

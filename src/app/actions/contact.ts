"use server";

import { Resend } from "resend";
import { env } from "@/lib/env";
import {
  contactFormSchema,
  type ContactFormInput,
} from "@/lib/validations/checkout";

const resend = new Resend(env.RESEND_API_KEY);

export async function submitContactForm(
  input: ContactFormInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ??
        "Please check the form and try again.",
    };
  }

  const { name, email, message } = parsed.data;

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: env.SUPPORT_EMAIL,
    replyTo: email,
    subject: `New contact form message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });

  if (error) {
    console.error("[contact] failed to send message", error);
    return {
      ok: false,
      error:
        "Something went wrong sending your message — please email us directly.",
    };
  }

  return { ok: true };
}

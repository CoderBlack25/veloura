"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  contactFormSchema,
  type ContactFormInput,
} from "@/lib/validations/checkout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { submitContactForm } from "@/app/actions/contact";

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInput>({ resolver: zodResolver(contactFormSchema) });

  async function onSubmit(values: ContactFormInput) {
    const result = await submitContactForm(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Message sent — we'll get back to you soon.");
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" className="mt-1.5" {...register("name")} />
        {errors.name && (
          <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          className="mt-1.5"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          rows={5}
          className="mt-1.5 w-full rounded-md border border-beige-main bg-cream-light px-3.5 py-2 text-sm text-brown-dark placeholder:text-gray-main/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-main focus-visible:border-green-main resize-none"
          {...register("message")}
        />
        {errors.message && (
          <p className="mt-1 text-xs text-destructive">
            {errors.message.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

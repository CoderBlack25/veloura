import { Resend } from "resend";
import { env } from "@/lib/env";
import OrderConfirmationEmail, {
  type OrderConfirmationEmailProps,
} from "../../emails/order-confirmation";
import ShippingConfirmationEmail, {
  type ShippingConfirmationEmailProps,
} from "../../emails/shipping-confirmation";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(
  to: string,
  props: OrderConfirmationEmailProps,
) {
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: `Your Veloura order #${props.orderId.slice(0, 8).toUpperCase()} is confirmed`,
    react: OrderConfirmationEmail(props),
  });

  if (error) {
    // Never let an email failure roll back a paid order — log loudly and
    // let a human follow up rather than throwing inside the webhook handler.
    console.error("[email] failed to send order confirmation", error);
  }
}

export async function sendShippingConfirmationEmail(
  to: string,
  props: ShippingConfirmationEmailProps,
) {
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: `Your Veloura order #${props.orderId.slice(0, 8).toUpperCase()} has shipped`,
    react: ShippingConfirmationEmail(props),
  });

  if (error) {
    console.error("[email] failed to send shipping confirmation", error);
  }
}

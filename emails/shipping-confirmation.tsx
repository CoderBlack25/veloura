import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type ShippingConfirmationEmailProps = {
  orderId: string;
  trackingNumber: string;
  trackingUrl: string;
  orderLookupUrl: string;
};

const brand = {
  brownDark: "#423027",
  greenMain: "#8a9675",
  creamLight: "#fffcf4",
  creamMuted: "#f3ebe4",
  beigeMain: "#d7c5bc",
  grayMain: "#4b5563",
};

export default function ShippingConfirmationEmail({
  orderId,
  trackingNumber,
  trackingUrl,
  orderLookupUrl,
}: ShippingConfirmationEmailProps) {
  const shortId = orderId.slice(0, 8).toUpperCase();

  return (
    <Html>
      <Head />
      <Preview>Your Veloura order #{shortId} is on its way</Preview>
      <Body
        style={{
          backgroundColor: brand.creamMuted,
          fontFamily: "Georgia, serif",
          padding: "24px 0",
        }}
      >
        <Container
          style={{
            backgroundColor: brand.creamLight,
            borderRadius: 12,
            padding: 32,
            maxWidth: 480,
          }}
        >
          <Text
            style={{
              color: brand.greenMain,
              fontSize: 12,
              letterSpacing: 3,
              fontWeight: 700,
            }}
          >
            VELOURA
          </Text>
          <Heading
            style={{
              color: brand.brownDark,
              fontSize: 24,
              margin: "8px 0 4px",
            }}
          >
            Your order has shipped
          </Heading>
          <Text style={{ color: brand.grayMain, fontSize: 14 }}>
            Order #{shortId} is on its way to you.
          </Text>

          <Hr style={{ borderColor: brand.beigeMain, margin: "20px 0" }} />

          <Text
            style={{
              color: brand.brownDark,
              fontSize: 13,
              fontWeight: 700,
              margin: "0 0 4px",
            }}
          >
            Tracking number
          </Text>
          <Text style={{ color: brand.grayMain, fontSize: 14, margin: 0 }}>
            {trackingNumber}
          </Text>

          <Section style={{ marginTop: 24, textAlign: "center" }}>
            <a
              href={trackingUrl}
              style={{
                backgroundColor: brand.brownDark,
                color: brand.creamLight,
                padding: "12px 24px",
                borderRadius: 8,
                fontSize: 14,
                textDecoration: "none",
                display: "inline-block",
                marginRight: 8,
              }}
            >
              Track package
            </a>
          </Section>
          <Section style={{ marginTop: 12, textAlign: "center" }}>
            <a
              href={orderLookupUrl}
              style={{ color: brand.grayMain, fontSize: 12 }}
            >
              View order details
            </a>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

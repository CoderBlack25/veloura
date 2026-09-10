import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

export type OrderConfirmationEmailProps = {
  orderId: string;
  customerEmail: string;
  items: Array<{
    name: string;
    variantLabel: string;
    quantity: number;
    lineTotalFormatted: string;
  }>;
  subtotalFormatted: string;
  shippingFormatted: string;
  taxFormatted: string;
  totalFormatted: string;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  orderLookupUrl: string;
};

const brand = {
  brownDark: "#423027",
  brownMain: "#574238",
  greenMain: "#8a9675",
  creamLight: "#fffcf4",
  creamMuted: "#f3ebe4",
  beigeMain: "#d7c5bc",
  grayMain: "#4b5563",
};

export default function OrderConfirmationEmail({
  orderId,
  items,
  subtotalFormatted,
  shippingFormatted,
  taxFormatted,
  totalFormatted,
  shippingAddress,
  orderLookupUrl,
}: OrderConfirmationEmailProps) {
  const shortId = orderId.slice(0, 8).toUpperCase();

  return (
    <Html>
      <Head />
      <Preview>Your Veloura order #{shortId} is confirmed</Preview>
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
            Thanks for your order
          </Heading>
          <Text style={{ color: brand.grayMain, fontSize: 14 }}>
            Order #{shortId} — we&apos;ll email you again the moment it ships.
          </Text>

          <Hr style={{ borderColor: brand.beigeMain, margin: "20px 0" }} />

          {items.map((item, i) => (
            <Row key={i} style={{ marginBottom: 8 }}>
              <Column>
                <Text
                  style={{
                    color: brand.brownDark,
                    fontSize: 14,
                    margin: 0,
                    fontWeight: 700,
                  }}
                >
                  {item.name}
                </Text>
                <Text
                  style={{ color: brand.grayMain, fontSize: 13, margin: 0 }}
                >
                  {item.variantLabel} × {item.quantity}
                </Text>
              </Column>
              <Column align="right">
                <Text
                  style={{ color: brand.brownDark, fontSize: 14, margin: 0 }}
                >
                  {item.lineTotalFormatted}
                </Text>
              </Column>
            </Row>
          ))}

          <Hr style={{ borderColor: brand.beigeMain, margin: "20px 0" }} />

          <Section>
            <Row>
              <Column>
                <Text
                  style={{
                    color: brand.grayMain,
                    fontSize: 13,
                    margin: "2px 0",
                  }}
                >
                  Subtotal
                </Text>
              </Column>
              <Column align="right">
                <Text
                  style={{
                    color: brand.grayMain,
                    fontSize: 13,
                    margin: "2px 0",
                  }}
                >
                  {subtotalFormatted}
                </Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text
                  style={{
                    color: brand.grayMain,
                    fontSize: 13,
                    margin: "2px 0",
                  }}
                >
                  Shipping
                </Text>
              </Column>
              <Column align="right">
                <Text
                  style={{
                    color: brand.grayMain,
                    fontSize: 13,
                    margin: "2px 0",
                  }}
                >
                  {shippingFormatted}
                </Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text
                  style={{
                    color: brand.grayMain,
                    fontSize: 13,
                    margin: "2px 0",
                  }}
                >
                  Tax
                </Text>
              </Column>
              <Column align="right">
                <Text
                  style={{
                    color: brand.grayMain,
                    fontSize: 13,
                    margin: "2px 0",
                  }}
                >
                  {taxFormatted}
                </Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text
                  style={{
                    color: brand.brownDark,
                    fontSize: 15,
                    fontWeight: 700,
                    margin: "6px 0 0",
                  }}
                >
                  Total
                </Text>
              </Column>
              <Column align="right">
                <Text
                  style={{
                    color: brand.brownDark,
                    fontSize: 15,
                    fontWeight: 700,
                    margin: "6px 0 0",
                  }}
                >
                  {totalFormatted}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={{ borderColor: brand.beigeMain, margin: "20px 0" }} />

          <Text
            style={{
              color: brand.brownDark,
              fontSize: 13,
              fontWeight: 700,
              margin: "0 0 4px",
            }}
          >
            Shipping to
          </Text>
          <Text
            style={{
              color: brand.grayMain,
              fontSize: 13,
              margin: 0,
              lineHeight: "20px",
            }}
          >
            {shippingAddress.name}
            <br />
            {shippingAddress.line1}
            {shippingAddress.line2 ? (
              <>
                <br />
                {shippingAddress.line2}
              </>
            ) : null}
            <br />
            {shippingAddress.city}, {shippingAddress.postalCode}
            <br />
            {shippingAddress.country}
          </Text>

          <Section style={{ marginTop: 28, textAlign: "center" }}>
            <a
              href={orderLookupUrl}
              style={{
                backgroundColor: brand.brownDark,
                color: brand.creamLight,
                padding: "12px 24px",
                borderRadius: 8,
                fontSize: 14,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Track your order
            </a>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

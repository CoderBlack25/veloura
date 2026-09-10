/**
 * Prices are stored as integer cents everywhere (see product_variants.price_cents
 * in the schema) specifically to avoid floating-point rounding bugs. These
 * helpers are the only place cents should be converted to a display string.
 */
export function formatMoney(
  cents: number,
  currency: string = "EUR",
  locale: string = "en-IE",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function centsToUnits(cents: number) {
  return Math.round(cents) / 100;
}

export function unitsToCents(units: number) {
  return Math.round(units * 100);
}

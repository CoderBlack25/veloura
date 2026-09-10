import { describe, it, expect } from "vitest";
import { formatMoney, centsToUnits, unitsToCents } from "@/lib/format";

describe("formatMoney", () => {
  it("formats whole euro amounts", () => {
    expect(formatMoney(1150, "EUR", "en-IE")).toBe("€11.50");
  });

  it("formats amounts under one unit", () => {
    expect(formatMoney(50, "EUR", "en-IE")).toBe("€0.50");
  });

  it("rounds to two decimal places", () => {
    // 1234 cents -> 12.34, never 12.3 or 12.340
    expect(formatMoney(1234, "EUR", "en-IE")).toBe("€12.34");
  });
});

describe("centsToUnits / unitsToCents", () => {
  it("round-trips without floating point drift", () => {
    expect(centsToUnits(2100)).toBe(21);
    expect(unitsToCents(21)).toBe(2100);
    expect(unitsToCents(4.5)).toBe(450);
  });

  it("rounds fractional cents rather than truncating", () => {
    expect(unitsToCents(4.005)).toBe(401); // 400.5 rounds to 401, not 400
  });
});

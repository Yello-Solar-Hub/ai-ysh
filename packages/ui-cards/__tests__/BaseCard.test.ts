import { describe, it, expect } from "vitest";
import { baseCardSchema } from "../BaseCard";

describe("baseCardSchema", () => {
  it("validates minimal data", () => {
    const data = { title: "t", value: "42" };
    expect(() => baseCardSchema.parse(data)).not.toThrow();
  });
});

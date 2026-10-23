import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

function token(name: string) {
  const value = css.match(new RegExp(`--color-${name}:\\s*(#[0-9A-Fa-f]{6})`))?.[1];
  if (!value) throw new Error(`Token ausente: ${name}`);
  return value;
}

function luminance(hex: string) {
  const channels = [1, 3, 5].map((offset) => {
    const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}

function contrast(foreground: string, background: string) {
  const values = [luminance(token(foreground)), luminance(token(background))];
  return (Math.max(...values) + .05) / (Math.min(...values) + .05);
}

describe("Legibilidade do tema Nocturne", () => {
  it.each(["bg", "surface", "sunken"])("mantém contraste AA de corpo e descrições sobre %s", (background) => {
    expect(contrast("text", background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("text-muted", background)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(["bg", "surface", "sunken"])("mantém links legíveis e foco perceptível sobre %s", (background) => {
    expect(contrast("accent-400", background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("accent-500", background)).toBeGreaterThanOrEqual(3);
  });

  it.each(["available", "maintenance", "overdue"])("mantém rótulo de estado %s legível no card", (state) => {
    expect(contrast(state, "surface")).toBeGreaterThanOrEqual(4.5);
  });
});

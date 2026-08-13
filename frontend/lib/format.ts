/** Initials of a name: first letter of the first two words, uppercased. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Deterministically pick a color from a palette for a given string, so the
 * same name always gets the same color across renders.
 */
export function hashColor(name: string, palette: string[]): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) % 9973;
  }
  return palette[h % palette.length];
}

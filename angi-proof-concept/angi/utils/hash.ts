/**
 * Generates a stable, short hash from a string using the djb2 algorithm.
 * Used to derive a consistent component ID from a description when no explicit ID is provided.
 *
 * Example: hash("Contact form with name and email") → "angi-a3f2c9"
 */
export function stableHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  // Convert to unsigned 32-bit int and format as hex
  const hex = (hash >>> 0).toString(16).padStart(8, "0").slice(0, 6);
  return `angi-${hex}`;
}

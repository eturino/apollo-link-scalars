/**
 * @hidden
 * @ignore
 */
export function mapIfArray<TOther, TItem, TResponse>(
  a: TOther | TItem[],
  fn: (x: TItem) => TResponse
): TOther | TResponse[] {
  return Array.isArray(a) ? a.map(fn) : a;
}

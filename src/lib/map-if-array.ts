import { isArray } from "lodash";

/**
 * @hidden
 * @ignore
 */
export function mapIfArray<TOther, TItem, TResponse>(
  a: TOther | TItem[],
  fn: (x: TItem) => TResponse
): TOther | TResponse[] {
  return isArray(a) ? a.map(fn) : a;
}

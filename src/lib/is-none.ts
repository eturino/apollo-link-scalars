/**
 * @hidden
 * @ignore
 */
export function isNone(x: any): x is null | undefined {
  return x === undefined || x === null;
}

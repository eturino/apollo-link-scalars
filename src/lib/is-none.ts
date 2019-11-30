import { isNull, isUndefined } from "lodash";

/**
 * @hidden
 * @ignore
 */
export function isNone(x: any): x is null | undefined {
  return isUndefined(x) || isNull(x);
}

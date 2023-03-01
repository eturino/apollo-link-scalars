import isNull from "lodash/isNull";
import isUndefined from "lodash/isUndefined";

/**
 * @hidden
 * @ignore
 */
export function isNone(x: any): x is null | undefined {
  return isUndefined(x) || isNull(x);
}

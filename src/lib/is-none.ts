import isNull from "lodash.isnull";
import isUndefined from "lodash.isundefined";

/**
 * @hidden
 * @ignore
 */
export function isNone(x: any): x is null | undefined {
  return isUndefined(x) || isNull(x);
}

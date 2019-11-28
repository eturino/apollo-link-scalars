import { isNull, isUndefined } from "lodash";

export function isNone(x: any): x is null | undefined {
  return isUndefined(x) || isNull(x);
}

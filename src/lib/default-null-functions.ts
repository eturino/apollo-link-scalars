import { NullFunctions } from "../types/null-functions";

/**
 * By default, make no transforms for null types. If you prefer, you could use these transforms to e.g.
 * transform null into a Maybe monad.
 */
const defaultNullFunctions: NullFunctions = {
  serialize(input: any) {
    return input;
  },
  parseValue(raw: any) {
    return raw;
  },
};

export default defaultNullFunctions;

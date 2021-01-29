/* tslint:disable:interface-over-type-literal */

export type NullFunctions = {
  serialize(input: any): any | null;
  parseValue(raw: any | null): any;
};

/* tslint:disable:interface-over-type-literal */
import {
  GraphQLLeafType,
  GraphQLScalarSerializer,
  GraphQLScalarValueParser
} from "graphql";

export type ParsingFunctionsObject<TParsed = any, TRaw = any> = {
  serialize: GraphQLScalarSerializer<TRaw>;
  parseValue: GraphQLScalarValueParser<TParsed>;
};

export type FunctionsMap = {
  [key: string]: GraphQLLeafType | ParsingFunctionsObject;
};

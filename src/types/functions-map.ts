import { GraphQLLeafType, GraphQLScalarSerializer, GraphQLScalarValueParser } from "graphql";

export interface ParsingFunctionsObject<TParsed = any, TRaw = any> {
  serialize: GraphQLScalarSerializer<TRaw>;
  parseValue: GraphQLScalarValueParser<TParsed>;
}

export type FunctionsMap = Record<string, GraphQLLeafType | ParsingFunctionsObject>;

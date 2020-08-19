import {
  getNullableType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLScalarType,
  GraphQLSchema,
  isEnumType,
  isListType,
  isScalarType,
} from "graphql";
import has from "lodash.has";
import mapValues from "lodash.mapvalues";
import { FunctionsMap, isNone, mapIfArray } from "..";

export class Serializer {
  constructor(
    readonly schema: GraphQLSchema,
    readonly functionsMap: FunctionsMap,
    readonly removeTypenameFromInputs: boolean
  ) {}

  public serialize(value: any, type: GraphQLInputType): any {
    if (isNone(value)) return value;

    return this.serializeNullable(value, getNullableType(type));
  }

  protected serializeNullable(value: any, type: GraphQLInputType): any {
    if (isScalarType(type) || isEnumType(type)) {
      return this.serializeLeaf(value, type);
    }

    if (isListType(type)) {
      return mapIfArray(value, (v) => this.serialize(v, type.ofType));
    }

    return this.serializeInputObject(value, type);
  }

  protected serializeLeaf(value: any, type: GraphQLScalarType | GraphQLEnumType): any {
    const fns = this.functionsMap[type.name] || type;
    return fns.serialize(value);
  }

  protected serializeInputObject(value: any, type: GraphQLInputObjectType): any {
    if (this.removeTypenameFromInputs && has(value, "__typename")) {
      delete value.__typename;
    }

    const fields = type.getFields();
    return mapValues(value, (v, key) => {
      const f = fields[key];
      return f ? this.serialize(v, f.type) : v;
    });
  }
}

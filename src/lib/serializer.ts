import {
  getNullableType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLNamedType,
  GraphQLScalarType,
  GraphQLSchema,
  isEnumType,
  isListType,
  isScalarType
} from "graphql";
import { isArray, mapValues } from "lodash";
import { FunctionsMap } from "..";
import { isNone } from "./is-none";

export class Serializer {
  constructor(
    readonly schema: GraphQLSchema,
    readonly functionsMap: FunctionsMap
  ) {}

  public serialize(value: any, type: GraphQLInputType): any {
    if (isListType(type)) {
      return isArray(value)
        ? value.map(v => this.serialize(v, type.ofType))
        : value;
    }

    return this.serializeNamed(value, getNullableType(type));
  }

  public serializeNamed(value: any, type: GraphQLNamedType): any {
    if (isScalarType(type) || isEnumType(type)) {
      return this.serializeLeaf(value, type);
    }

    if (isNone(value)) return value;

    return this.serializeInputObject(value, type as GraphQLInputObjectType);
  }

  protected serializeLeaf(
    value: any,
    type: GraphQLScalarType | GraphQLEnumType
  ): any {
    const fns = this.functionsMap[type.name] || type;
    return fns.serialize(value);
  }

  protected serializeInputObject(
    value: any,
    type: GraphQLInputObjectType
  ): any {
    const fields = type.getFields();
    return mapValues(value, (v, key) => {
      const f = fields[key];
      return f ? this.serialize(v, f.type) : v;
    });
  }
}

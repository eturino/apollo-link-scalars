import {
  getNullableType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLScalarType,
  GraphQLSchema,
  isEnumType,
  isListType,
  isNonNullType,
  isScalarType,
} from "graphql";
import { FunctionsMap } from "../types/functions-map";
import { NullFunctions } from "../types/null-functions";
import { isNone } from "./is-none";
import { mapIfArray } from "./map-if-array";

export class Serializer {
  constructor(
    readonly schema: GraphQLSchema,
    readonly functionsMap: FunctionsMap,
    readonly removeTypenameFromInputs: boolean,
    readonly nullFunctions: NullFunctions
  ) {}

  public serialize(value: any, type: GraphQLInputType): any {
    if (isNonNullType(type)) {
      return this.serializeInternal(value, getNullableType(type));
    } else {
      return this.serializeNullable(value, getNullableType(type));
    }
  }

  protected serializeNullable(value: any, type: GraphQLInputType): any {
    return this.nullFunctions.serialize(this.serializeInternal(value, type));
  }

  protected serializeInternal(value: any, type: GraphQLInputType): any {
    if (isNone(value)) {
      return value;
    }

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

  protected serializeInputObject(givenValue: any, type: GraphQLInputObjectType): any {
    const value = givenValue;
    if (this.removeTypenameFromInputs) {
      delete value["__typename"];
    }

    const ret: any = {};
    const fields = type.getFields();
    for (const [key, val] of Object.entries(value)) {
      const f = fields[key];
      ret[key] = f ? this.serialize(val, f.type) : val;
    }
    return ret;
  }
}

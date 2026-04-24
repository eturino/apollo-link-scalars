import type {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLScalarType,
  GraphQLSchema,
} from "graphql";
import type { FunctionsMap } from "../types/functions-map";
import type { NullFunctions } from "../types/null-functions";
import {
  ensureNullableTypeLike,
  isEnumTypeLike,
  isListTypeLike,
  isNonNullTypeLike,
  isScalarTypeLike,
} from "./graphql-type-guards";
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
    const nullableType = ensureNullableTypeLike(type) as GraphQLInputType;
    if (isNonNullTypeLike(type)) {
      return this.serializeInternal(value, nullableType);
    } else {
      return this.serializeNullable(value, nullableType);
    }
  }

  protected serializeNullable(value: any, type: GraphQLInputType): any {
    return this.nullFunctions.serialize(this.serializeInternal(value, type));
  }

  protected serializeInternal(value: any, type: GraphQLInputType): any {
    if (isNone(value)) {
      return value;
    }

    if (isScalarTypeLike(type) || isEnumTypeLike(type)) {
      return this.serializeLeaf(value, type);
    }

    if (isListTypeLike(type)) {
      return mapIfArray(value, (v) => this.serialize(v, type.ofType));
    }

    return this.serializeInputObject(value, type);
  }

  protected serializeLeaf(value: any, type: GraphQLScalarType | GraphQLEnumType): any {
    const fns = this.functionsMap[type.name] ?? type;
    return fns.serialize(value);
  }

  protected serializeInputObject(givenValue: any, type: GraphQLInputObjectType): any {
    let value = givenValue;
    if (this.removeTypenameFromInputs) {
      value = { ...givenValue };
      delete value.__typename;
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

import {
  type GraphQLOutputType,
  type GraphQLSchema,
  isListType,
  isNonNullType,
  isObjectType,
  isScalarType,
} from "graphql";
import type { FunctionsMap } from "../types/functions-map";
import { isNone } from "./is-none";

/**
 * Re-applies the custom scalar `parseValue` functions to a cache snapshot that
 * has been round-tripped through JSON (localStorage / AsyncStorage / any store
 * that uses `apollo3-cache-persist` or equivalent).
 *
 * Fix for https://github.com/eturino/apollo-link-scalars/issues/760 — the
 * scalar link only sees operations flowing through `ApolloLink`, so values
 * restored via `cache.restore()` come back as the JSON shape they had in
 * storage (`Date` -> ISO string, custom `Money` -> the serialized form, etc.)
 * and the consumer never gets the parsed types.
 *
 * Pure and schema-driven: no dependency on `ApolloCache`. Call it on the
 * payload *before* `cache.restore(...)` or after you read it from the
 * persisted store yourself.
 *
 * @example
 * const raw = JSON.parse(await AsyncStorage.getItem("apollo-cache"));
 * cache.restore(reviveScalarsInCache(raw, schema, typesMap));
 *
 * @example
 * await persistCache({ cache, storage });
 * cache.restore(reviveScalarsInCache(cache.extract(), schema, typesMap));
 */
export function reviveScalarsInCache<T extends Record<string, unknown>>(
  extracted: T,
  schema: GraphQLSchema,
  typesMap: FunctionsMap
): T {
  for (const value of Object.values(extracted)) {
    if (isEntityObject(value)) {
      reviveEntity(value, schema, typesMap);
    }
  }
  return extracted;
}

interface EntityObject {
  __typename?: string;
  [key: string]: unknown;
}

function isEntityObject(value: unknown): value is EntityObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRef(value: unknown): value is { __ref: string } {
  return isEntityObject(value) && typeof (value as { __ref?: unknown }).__ref === "string";
}

// Cache field keys may encode call arguments as `fieldName({"id":"1"})` or with
// keyArgs as `fieldName:{"id":"1"}`. Strip anything from the first `(` or `:`
// onwards so we can look up the field on the schema type.
function extractFieldName(cacheKey: string): string {
  const parenIdx = cacheKey.indexOf("(");
  const colonIdx = cacheKey.indexOf(":");
  const boundaries = [parenIdx, colonIdx].filter((i) => i >= 0);
  return boundaries.length === 0 ? cacheKey : cacheKey.slice(0, Math.min(...boundaries));
}

function reviveEntity(entity: EntityObject, schema: GraphQLSchema, typesMap: FunctionsMap): void {
  const typename = entity.__typename;
  if (!typename) return;
  const type = schema.getType(typename);
  if (!isObjectType(type)) return;
  const fields = type.getFields();

  for (const cacheKey of Object.keys(entity)) {
    if (cacheKey === "__typename") continue;
    const field = fields[extractFieldName(cacheKey)];
    if (!field) continue;
    entity[cacheKey] = reviveValue(entity[cacheKey], field.type, schema, typesMap);
  }
}

function reviveValue(value: unknown, type: GraphQLOutputType, schema: GraphQLSchema, typesMap: FunctionsMap): unknown {
  if (isNone(value)) return value;
  const nullable = isNonNullType(type) ? type.ofType : type;

  if (isListType(nullable)) {
    if (!Array.isArray(value)) return value;
    return value.map((element) => reviveValue(element, nullable.ofType, schema, typesMap));
  }

  if (isScalarType(nullable)) {
    const funcs = typesMap[nullable.name];
    return funcs ? funcs.parseValue(value) : value;
  }

  // Embedded non-normalized object (has __typename inline) — recurse.
  // Normalized references (__ref) are walked via the top-level loop instead.
  if (isObjectType(nullable) && isEntityObject(value) && !isRef(value)) {
    reviveEntity(value, schema, typesMap);
  }

  // Interfaces, unions, enums, ref objects fall through unchanged.
  return value;
}

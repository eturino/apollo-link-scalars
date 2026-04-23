import {
  type GraphQLLeafType,
  type GraphQLOutputType,
  type GraphQLSchema,
  isLeafType,
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
 *
 * @remarks
 * Mutates `extracted` in place and returns the same reference. The
 * generic signature is there for type flow, not copy semantics. Pass
 * a fresh snapshot such as `cache.extract()` (already a clone of the
 * live cache) or a `JSON.parse(...)` result; don't pass a live
 * in-memory structure shared with the rest of the app.
 *
 * Merges `typesMap` with the schema's own leaf types the same way
 * `withScalars` does (see `src/lib/link.ts`). A scalar defined
 * programmatically via `new GraphQLScalarType({ parseValue })` will
 * therefore be applied on rehydration even when the caller's
 * `typesMap` omits it, matching the network-path behavior.
 *
 * Idempotence is caller-contingent. `reviveScalarsInCache` calls
 * `parseValue` once per field per pass, so invoking it twice on the
 * same snapshot parses every scalar twice. Safe only when the
 * supplied `parseValue` is itself idempotent — e.g. a `DateTime`
 * parser that guards with `typeof v === "string"` before constructing
 * a `Date` will leave `Date` instances alone on the second pass. A
 * naive `Money` parser like `(v) => Number(v) * 100` is NOT
 * idempotent: first pass turns `"1.50"` into `150`, second pass turns
 * `150` into `15000` — silent corruption. When in doubt, make
 * `parseValue` detect its own output and short-circuit.
 */
export function reviveScalarsInCache<T extends Record<string, unknown>>(
  extracted: T,
  schema: GraphQLSchema,
  typesMap: FunctionsMap
): T {
  const functionsMap = buildFunctionsMap(schema, typesMap);
  for (const value of Object.values(extracted)) {
    if (isEntityObject(value)) {
      reviveEntity(value, schema, functionsMap);
    }
  }
  return extracted;
}

// Mirror of `ScalarApolloLink`'s constructor logic (`src/lib/link.ts`):
// take every leaf type off the schema and let the caller's `typesMap`
// override it. Keeps the revive path and the network path in lockstep
// on which scalars get `parseValue`'d.
function buildFunctionsMap(schema: GraphQLSchema, typesMap: FunctionsMap): FunctionsMap {
  const leafTypesMap: Record<string, GraphQLLeafType> = {};
  for (const [key, value] of Object.entries(schema.getTypeMap())) {
    if (isLeafType(value)) leafTypesMap[key] = value;
  }
  return { ...leafTypesMap, ...typesMap };
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

function reviveEntity(entity: EntityObject, schema: GraphQLSchema, functionsMap: FunctionsMap): void {
  const typename = entity.__typename;
  if (!typename) return;
  const type = schema.getType(typename);
  if (!isObjectType(type)) return;
  const fields = type.getFields();

  for (const cacheKey of Object.keys(entity)) {
    if (cacheKey === "__typename") continue;
    const field = fields[extractFieldName(cacheKey)];
    if (!field) continue;
    entity[cacheKey] = reviveValue(entity[cacheKey], field.type, schema, functionsMap);
  }
}

function reviveValue(
  value: unknown,
  type: GraphQLOutputType,
  schema: GraphQLSchema,
  functionsMap: FunctionsMap
): unknown {
  if (isNone(value)) return value;
  const nullable = isNonNullType(type) ? type.ofType : type;

  if (isListType(nullable)) {
    if (!Array.isArray(value)) return value;
    return value.map((element) => reviveValue(element, nullable.ofType, schema, functionsMap));
  }

  if (isScalarType(nullable)) {
    const funcs = functionsMap[nullable.name] ?? nullable;
    return funcs.parseValue(value);
  }

  // Embedded non-normalized object (has __typename inline) — recurse.
  // Normalized references (__ref) are walked via the top-level loop instead.
  if (isObjectType(nullable) && isEntityObject(value) && !isRef(value)) {
    reviveEntity(value, schema, functionsMap);
  }

  // Interfaces, unions, enums, ref objects fall through unchanged.
  return value;
}

import type {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLLeafType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLNullableType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLType,
} from "graphql";

// graphql-js v16 defines a `Symbol.toStringTag` getter on every type class
// that returns a stable string literal (e.g. `"GraphQLScalarType"`). Reading
// the tag is realm-agnostic AND survives bundler minification, where the
// constructor name would otherwise be mangled (issue #1565).
function tag(value: unknown): string | undefined {
  if (!value || (typeof value !== "object" && typeof value !== "function")) return undefined;
  const t = (value as { [Symbol.toStringTag]?: unknown })[Symbol.toStringTag];
  if (typeof t === "string") return t;
  // Fallback: pre-minified or non-graphql-js implementations may still set
  // `constructor.name` even when no Symbol.toStringTag is exposed.
  const ctor = (value as { constructor?: { name?: unknown } }).constructor;
  return typeof ctor?.name === "string" ? ctor.name : undefined;
}

export function isNonNullTypeLike(type: GraphQLType | null | undefined): type is GraphQLNonNull<GraphQLType> {
  return tag(type) === "GraphQLNonNull";
}

export function isListTypeLike(type: GraphQLType | null | undefined): type is GraphQLList<GraphQLType> {
  return tag(type) === "GraphQLList";
}

export function isScalarTypeLike(type: unknown): type is GraphQLScalarType {
  return tag(type) === "GraphQLScalarType";
}

export function isEnumTypeLike(type: unknown): type is GraphQLEnumType {
  return tag(type) === "GraphQLEnumType";
}

export function isInputObjectTypeLike(type: unknown): type is GraphQLInputObjectType {
  return tag(type) === "GraphQLInputObjectType";
}

export function isObjectTypeLike(type: unknown): type is GraphQLObjectType {
  return tag(type) === "GraphQLObjectType";
}

export function isLeafTypeLike(type: unknown): type is GraphQLLeafType {
  return isScalarTypeLike(type) || isEnumTypeLike(type);
}

export function isInputTypeLike(type: GraphQLType | null | undefined): type is GraphQLInputType {
  if (!type) return false;
  if (isNonNullTypeLike(type) || isListTypeLike(type)) {
    return isInputTypeLike(type.ofType);
  }
  return isScalarTypeLike(type) || isEnumTypeLike(type) || isInputObjectTypeLike(type);
}

export function ensureNullableTypeLike(type: GraphQLType): GraphQLNullableType {
  return isNonNullTypeLike(type) ? type.ofType : type;
}

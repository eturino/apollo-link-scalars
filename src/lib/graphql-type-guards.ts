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

function ctorName(value: unknown): string | undefined {
  if (!value || (typeof value !== "object" && typeof value !== "function")) return undefined;
  const ctor = (value as { constructor?: { name?: unknown } }).constructor;
  return typeof ctor?.name === "string" ? ctor.name : undefined;
}

export function isNonNullTypeLike(type: GraphQLType | null | undefined): type is GraphQLNonNull<GraphQLType> {
  return ctorName(type) === "GraphQLNonNull";
}

export function isListTypeLike(type: GraphQLType | null | undefined): type is GraphQLList<GraphQLType> {
  return ctorName(type) === "GraphQLList";
}

export function isScalarTypeLike(type: unknown): type is GraphQLScalarType {
  return ctorName(type) === "GraphQLScalarType";
}

export function isEnumTypeLike(type: unknown): type is GraphQLEnumType {
  return ctorName(type) === "GraphQLEnumType";
}

export function isInputObjectTypeLike(type: unknown): type is GraphQLInputObjectType {
  return ctorName(type) === "GraphQLInputObjectType";
}

export function isObjectTypeLike(type: unknown): type is GraphQLObjectType {
  return ctorName(type) === "GraphQLObjectType";
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

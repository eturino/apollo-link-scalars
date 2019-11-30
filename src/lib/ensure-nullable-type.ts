import {
  FieldNode,
  getNullableType,
  GraphQLError,
  GraphQLInputType,
  GraphQLNullableType,
  GraphQLOutputType,
  isNonNullType
} from "graphql";
import { isNone } from "./is-none";

export function ensureNullableType(
  value: any,
  type: GraphQLOutputType | GraphQLInputType,
  fieldNode: FieldNode
): GraphQLNullableType {
  if (!isNonNullType(type)) return type;

  if (isNone(value)) {
    const where = fieldNode.alias
      ? `"${fieldNode.name.value}" (alias "${fieldNode.alias.value}")`
      : `"${fieldNode.name.value}"`;
    throw new GraphQLError(`non-null field ${where} with null value`);
  }

  return getNullableType(type);
}

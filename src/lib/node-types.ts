import {
  type DefinitionNode,
  type FieldNode,
  type FragmentDefinitionNode,
  type FragmentSpreadNode,
  type InlineFragmentNode,
  Kind,
  type ListTypeNode,
  type NamedTypeNode,
  type NonNullTypeNode,
  type OperationDefinitionNode,
  type SelectionNode,
  type SelectionSetNode,
  type TypeNode,
} from "graphql";
import type { MutOrRO } from "../types/mut-or-ro";

type ReducedSelectionSetNode = Omit<SelectionSetNode, "selections"> & {
  selections: MutOrRO<ReducedFieldNode[]>;
};

export type ReducedFieldNode = Omit<FieldNode, "selectionSet"> & {
  selectionSet?: ReducedSelectionSetNode;
};

export type ReducedOperationDefinitionNode = Omit<OperationDefinitionNode, "selectionSet"> & {
  readonly selectionSet: ReducedSelectionSetNode;
};

export function isOperationDefinitionNode(node: DefinitionNode): node is OperationDefinitionNode {
  return node.kind === Kind.OPERATION_DEFINITION;
}

export function isFragmentDefinitionNode(node: DefinitionNode): node is FragmentDefinitionNode {
  return node.kind === Kind.FRAGMENT_DEFINITION;
}

export function isFieldNode(node: SelectionNode): node is FieldNode {
  return node.kind === Kind.FIELD;
}

export function isFragmentSpreadNode(node: SelectionNode): node is FragmentSpreadNode {
  return node.kind === Kind.FRAGMENT_SPREAD;
}

export function isInlineFragmentNode(node: SelectionNode): node is InlineFragmentNode {
  return node.kind === Kind.INLINE_FRAGMENT;
}

/**
 * @public - kept as part of the complete GraphQL-AST type-guard set exposed
 * by this internal module even if no other module in the library currently
 * imports it.
 */
export function isNamedTypeNode(node: TypeNode): node is NamedTypeNode {
  return node.kind === Kind.NAMED_TYPE;
}

export function isListTypeNode(node: TypeNode): node is ListTypeNode {
  return node.kind === Kind.LIST_TYPE;
}

export function isNonNullTypeNode(node: TypeNode): node is NonNullTypeNode {
  return node.kind === Kind.NON_NULL_TYPE;
}

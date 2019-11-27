import {
  DefinitionNode,
  FieldNode,
  FragmentDefinitionNode,
  FragmentSpreadNode,
  InlineFragmentNode,
  OperationDefinitionNode,
  SelectionNode,
  SelectionSetNode
} from "graphql";
import { MutOrRO } from "../types/mut-or-ro";

type ReducedSelectionSetNode = SelectionSetNode & {
  selections: MutOrRO<ReducedFieldNode[]>;
};

export type ReducedFieldNode = FieldNode & {
  selectionSet?: ReducedSelectionSetNode;
};

export type ReducedOperationDefinitionNode = OperationDefinitionNode & {
  readonly selectionSet: SelectionSetNode & ReducedSelectionSetNode;
};

export function isOperationDefinitionNode(
  node: DefinitionNode
): node is OperationDefinitionNode {
  return node.kind === "OperationDefinition";
}

export function isFragmentDefinitionNode(
  node: DefinitionNode
): node is FragmentDefinitionNode {
  return node.kind === "FragmentDefinition";
}

export function isFieldNode(node: SelectionNode): node is FieldNode {
  return node.kind === "Field";
}

export function isFragmentSpreadNode(
  node: SelectionNode
): node is FragmentSpreadNode {
  return node.kind === "FragmentSpread";
}

export function isInlineFragmentNode(
  node: SelectionNode
): node is InlineFragmentNode {
  return node.kind === "InlineFragment";
}

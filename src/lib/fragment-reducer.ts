import { DocumentNode } from "graphql";
import { fragmentMapFrom, replaceFragmentsOn } from "./fragment-utils";
import { isFragmentDefinitionNode, isOperationDefinitionNode, ReducedOperationDefinitionNode } from "./node-types";

export function fragmentReducer(doc: DocumentNode): ReducedOperationDefinitionNode | null {
  if (!doc || !doc.definitions || !doc.definitions.length) return null;
  const operationNode = doc.definitions.find(isOperationDefinitionNode) || null;
  if (!operationNode) return null;

  const fragments = doc.definitions.filter(isFragmentDefinitionNode);
  const fragmentMap = fragmentMapFrom(fragments);
  const { selections, ...selectionSet } = operationNode.selectionSet;
  const list = replaceFragmentsOn(selections, fragmentMap);
  return {
    ...operationNode,
    selectionSet: { ...selectionSet, selections: list },
  };
}

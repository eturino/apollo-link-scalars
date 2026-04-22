import { DocumentNode } from "graphql";
import { fragmentMapFrom, replaceFragmentsOn } from "./fragment-utils";
import { isFragmentDefinitionNode, isOperationDefinitionNode, ReducedOperationDefinitionNode } from "./node-types";

export function fragmentReducer(doc: DocumentNode): ReducedOperationDefinitionNode | null {
  // Defensive checks covered by an existing test that calls this with
  // `null`, `{}`, and `{ definitions: [] }` via `as unknown as`. The
  // optional chains are "unnecessary" per the declared type, but they
  // are load-bearing at runtime.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!doc?.definitions?.length) return null;
  const operationNode = doc.definitions.find(isOperationDefinitionNode) ?? null;
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

import { FieldNode, FragmentDefinitionNode, SelectionNode } from "graphql";
import {
  Dictionary,
  every,
  flatMap,
  fromPairs,
  isArray,
  map,
  uniqBy
} from "lodash";
import { MutOrRO } from "../types/mut-or-ro";
import {
  isFieldNode,
  isInlineFragmentNode,
  ReducedFieldNode
} from "./node-types";

export function uniqueNodes<T extends FieldNode>(nodes: T[]): T[] {
  return uniqBy(nodes, fn =>
    JSON.stringify([fn.alias && fn.alias.value, fn.name.value])
  );
}

export function replaceFragmentsOn(
  selections: MutOrRO<SelectionNode[]>,
  fragmentMap: Dictionary<FragmentDefinitionNode | ReducedFieldNode[]>
): ReducedFieldNode[] {
  const cleaned: SelectionNode[] = flatMap(selections, sn => {
    if (isFieldNode(sn)) return [sn];
    if (isInlineFragmentNode(sn)) return sn.selectionSet.selections;
    const nodeOrSelectionList = fragmentMap[sn.name.value];
    if (!nodeOrSelectionList) return [];
    if (isArray(nodeOrSelectionList)) return nodeOrSelectionList; // selection
    return nodeOrSelectionList.selectionSet.selections; // fragment node
  });

  if (!every(cleaned, isFieldNode)) {
    return replaceFragmentsOn(cleaned, fragmentMap);
  }

  const fieldNodes = cleaned as FieldNode[];
  const resolved = fieldNodes.map(fn => {
    const { selectionSet, ...restFn } = fn;
    if (
      !selectionSet ||
      !selectionSet.selections ||
      !selectionSet.selections.length
    ) {
      return { ...restFn };
    }

    const replacedSelections = replaceFragmentsOn(
      selectionSet.selections,
      fragmentMap
    );
    return {
      ...restFn,
      selectionSet: { ...selectionSet, selections: replacedSelections }
    };
  });

  return uniqueNodes(resolved);
}

export function fragmentMapFrom(
  fragments: FragmentDefinitionNode[]
): Dictionary<ReducedFieldNode[]> {
  const initialMap = fromPairs(map(fragments, f => [f.name.value, f]));
  return fromPairs(
    map(fragments, f => {
      const fieldNodes = replaceFragmentsOn(
        f.selectionSet.selections,
        initialMap
      );
      return [f.name.value, fieldNodes];
    })
  );
}

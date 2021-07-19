import { FieldNode, FragmentDefinitionNode, SelectionNode } from "graphql";
import every from "lodash.every";
import flatMap from "lodash.flatmap";
import fromPairs from "lodash.frompairs";
import uniqBy from "lodash.uniqby";
import { Dictionary } from "../types/dictionary";
import { MutOrRO } from "../types/mut-or-ro";
import { isFieldNode, isInlineFragmentNode, ReducedFieldNode } from "./node-types";

function uniqueNodes<T extends FieldNode>(nodes: T[]): T[] {
  return uniqBy(nodes, (fn) => JSON.stringify(fieldNodeKeyTuple(fn)));
}

type KeyTuple = [string | undefined, string, string[]];
type SelectionKey = { field?: KeyTuple; inlineFragments?: SelectionKey[]; namedFragment?: string };

function fieldNodeKeyTuple(fn: FieldNode): KeyTuple {
  const alias = fn.alias?.value;
  const name = fn.name.value;
  const selections = fn.selectionSet?.selections ?? [];
  const selectionKeys = selections.map((sn) => JSON.stringify(selectionKeyTuples(sn))).sort();
  return [alias, name, selectionKeys];
}

function selectionKeyTuples(sn: SelectionNode): SelectionKey {
  if (isFieldNode(sn)) return { field: fieldNodeKeyTuple(sn) };
  if (isInlineFragmentNode(sn)) {
    return { inlineFragments: sn.selectionSet.selections.map((sn) => selectionKeyTuples(sn)) };
  }

  return { namedFragment: sn.name.value };
}

function getCleanedSelections(
  selections: MutOrRO<SelectionNode[]>,
  fragmentMap: Dictionary<FragmentDefinitionNode | ReducedFieldNode[]>
): SelectionNode[] {
  return flatMap(selections, (sn) => {
    if (isFieldNode(sn)) return [sn];
    if (isInlineFragmentNode(sn)) return sn.selectionSet.selections;

    const nodeOrSelectionList = fragmentMap[sn.name.value];
    if (!nodeOrSelectionList) return [];

    return Array.isArray(nodeOrSelectionList) ? nodeOrSelectionList : nodeOrSelectionList.selectionSet.selections; // fragment node
  });
}

function getResolvedFieldNodes(
  fieldNodes: FieldNode[],
  fragmentMap: Dictionary<FragmentDefinitionNode | ReducedFieldNode[]>
): ReducedFieldNode[] {
  return fieldNodes.map((fn) => {
    const { selectionSet, ...restFn } = fn;
    if (!selectionSet || !selectionSet.selections || !selectionSet.selections.length) {
      return { ...restFn };
    }

    const replacedSelections = replaceFragmentsOn(selectionSet.selections, fragmentMap);
    return {
      ...restFn,
      selectionSet: { ...selectionSet, selections: replacedSelections },
    };
  });
}

export function replaceFragmentsOn(
  selections: MutOrRO<SelectionNode[]>,
  fragmentMap: Dictionary<FragmentDefinitionNode | ReducedFieldNode[]>
): ReducedFieldNode[] {
  const cleaned = getCleanedSelections(selections, fragmentMap);

  if (!every(cleaned, isFieldNode)) {
    return replaceFragmentsOn(cleaned, fragmentMap);
  }

  const resolved = getResolvedFieldNodes(cleaned as FieldNode[], fragmentMap);
  const uniqueList = uniqueNodes(resolved);
  return uniqueList;
}

export function fragmentMapFrom(fragments: FragmentDefinitionNode[]): Dictionary<ReducedFieldNode[]> {
  const initialMap = fromPairs(fragments.map((f) => [f.name.value, f]));
  return fromPairs(
    fragments.map((f) => {
      const fieldNodes = replaceFragmentsOn(f.selectionSet.selections, initialMap);
      return [f.name.value, fieldNodes];
    })
  );
}

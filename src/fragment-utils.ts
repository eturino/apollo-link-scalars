import {
  FieldNode,
  FragmentDefinitionNode,
  SelectionNode,
  SelectionSetNode
} from "graphql";
import { Dictionary, every, flatMap, fromPairs, map, uniqBy } from "lodash";
import { isFieldNode, isInlineFragmentNode } from "./node-types";
import { MutOrRO } from "./types/mut-or-ro";

export type ResolvedFieldNode = FieldNode & {
  selectionSet?: SelectionSetNode & {
    selections: MutOrRO<ResolvedFieldNode[]>;
  };
};

export function replaceFragmentsOn(
  selections: MutOrRO<SelectionNode[]>,
  list: FragmentDefinitionNode[]
): ResolvedFieldNode[] {
  const cleaned: SelectionNode[] = flatMap(selections, sn => {
    if (isFieldNode(sn)) return [sn];
    if (isInlineFragmentNode(sn)) return sn.selectionSet.selections;
    const fragment = list.find(f => f.name.value === sn.name.value);
    return fragment ? fragment.selectionSet.selections : [];
  });

  if (!every(cleaned, isFieldNode)) {
    return replaceFragmentsOn(cleaned, list);
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
      list
    );
    return {
      ...restFn,
      selectionSet: { ...selectionSet, selections: replacedSelections }
    };
  });

  return uniqBy(resolved, fn => fn.name.value);
}

export function fragmentMapFrom(
  fragments: FragmentDefinitionNode[]
): Dictionary<ResolvedFieldNode[]> {
  return fromPairs(
    map(fragments, f => {
      const fieldNodes = replaceFragmentsOn(
        f.selectionSet.selections,
        fragments
      );
      return [f.name.value, fieldNodes];
    })
  );
}

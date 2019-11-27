import { DefinitionNode, SelectionNode } from "graphql";
import {
  isFieldNode,
  isFragmentDefinitionNode,
  isFragmentSpreadNode,
  isInlineFragmentNode,
  isOperationDefinitionNode
} from "../node-types";

describe("specific DefinitionNode", () => {
  describe("isOperationDefinitionNode", () => {
    it("with kind OperationDefinition => true", () => {
      expect(
        isOperationDefinitionNode(({
          kind: "OperationDefinition"
        } as unknown) as DefinitionNode)
      ).toBeTruthy();
    });

    it("otherwise => false", () => {
      expect(
        isOperationDefinitionNode(({
          kind: "whatever"
        } as unknown) as DefinitionNode)
      ).toBeFalsy();
    });
  });

  describe("isFragmentDefinitionNode", () => {
    it("with kind OperationDefinition => true", () => {
      expect(
        isFragmentDefinitionNode(({
          kind: "FragmentDefinition"
        } as unknown) as DefinitionNode)
      ).toBeTruthy();
    });

    it("otherwise => false", () => {
      expect(
        isFragmentDefinitionNode(({
          kind: "whatever"
        } as unknown) as DefinitionNode)
      ).toBeFalsy();
    });
  });
});

describe("specific SelectionNode", () => {
  describe("isFieldNode", () => {
    it("with kind OperationDefinition => true", () => {
      expect(
        isFieldNode(({
          kind: "Field"
        } as unknown) as SelectionNode)
      ).toBeTruthy();
    });

    it("otherwise => false", () => {
      expect(
        isFieldNode(({
          kind: "whatever"
        } as unknown) as SelectionNode)
      ).toBeFalsy();
    });
  });

  describe("isFragmentSpreadNode", () => {
    it("with kind OperationDefinition => true", () => {
      expect(
        isFragmentSpreadNode(({
          kind: "FragmentSpread"
        } as unknown) as SelectionNode)
      ).toBeTruthy();
    });

    it("otherwise => false", () => {
      expect(
        isFragmentSpreadNode(({
          kind: "whatever"
        } as unknown) as SelectionNode)
      ).toBeFalsy();
    });
  });

  describe("isInlineFragmentNode", () => {
    it("with kind OperationDefinition => true", () => {
      expect(
        isInlineFragmentNode(({
          kind: "InlineFragment"
        } as unknown) as SelectionNode)
      ).toBeTruthy();
    });

    it("otherwise => false", () => {
      expect(
        isInlineFragmentNode(({
          kind: "whatever"
        } as unknown) as SelectionNode)
      ).toBeFalsy();
    });
  });
});

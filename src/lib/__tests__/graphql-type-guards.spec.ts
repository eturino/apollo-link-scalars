import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLString,
} from "graphql";
import { describe, expect, it } from "vitest";
import {
  isEnumTypeLike,
  isInputObjectTypeLike,
  isListTypeLike,
  isNonNullTypeLike,
  isObjectTypeLike,
  isScalarTypeLike,
} from "../graphql-type-guards";

describe("graphql type guards", () => {
  describe("real graphql-js instances", () => {
    it("recognizes scalar, enum, object, input-object, list, non-null", () => {
      const scalar = new GraphQLScalarType({ name: "X" });
      const enumT = new GraphQLEnumType({ name: "E", values: { A: { value: "A" } } });
      const obj = new GraphQLObjectType({ name: "O", fields: { a: { type: GraphQLString } } });
      const input = new GraphQLInputObjectType({ name: "I", fields: { a: { type: GraphQLString } } });
      const list = new GraphQLList(GraphQLString);
      const nonNull = new GraphQLNonNull(GraphQLString);

      expect(isScalarTypeLike(scalar)).toBe(true);
      expect(isEnumTypeLike(enumT)).toBe(true);
      expect(isObjectTypeLike(obj)).toBe(true);
      expect(isInputObjectTypeLike(input)).toBe(true);
      expect(isListTypeLike(list)).toBe(true);
      expect(isNonNullTypeLike(nonNull)).toBe(true);
    });

    it("rejects mismatched types", () => {
      const scalar = new GraphQLScalarType({ name: "X" });
      expect(isObjectTypeLike(scalar)).toBe(false);
      expect(isEnumTypeLike(scalar)).toBe(false);
      expect(isListTypeLike(scalar)).toBe(false);
      expect(isNonNullTypeLike(scalar)).toBe(false);
    });

    it("returns false for nullish or non-object inputs", () => {
      expect(isScalarTypeLike(null)).toBe(false);
      expect(isScalarTypeLike(undefined)).toBe(false);
      expect(isScalarTypeLike(42)).toBe(false);
      expect(isScalarTypeLike("GraphQLScalarType")).toBe(false);
    });
  });

  // Simulates a bundler that mangles the constructor name (issue #1565):
  // graphql-js still exposes a stable `Symbol.toStringTag` getter even after
  // minification, so the guards must read the tag — not `constructor.name`.
  describe("minified-name simulation", () => {
    function mangledLike(tag: string): unknown {
      class Mangled {
        get [Symbol.toStringTag](): string {
          return tag;
        }
      }
      // Rename the constructor so `.constructor.name` does NOT match the
      // GraphQL* literal anymore.
      Object.defineProperty(Mangled, "name", { value: "a" });
      return new Mangled();
    }

    it("recognizes scalars by Symbol.toStringTag when constructor.name is mangled", () => {
      expect(isScalarTypeLike(mangledLike("GraphQLScalarType"))).toBe(true);
    });

    it("recognizes enums, objects, input-objects, lists, non-nulls by tag", () => {
      expect(isEnumTypeLike(mangledLike("GraphQLEnumType"))).toBe(true);
      expect(isObjectTypeLike(mangledLike("GraphQLObjectType"))).toBe(true);
      expect(isInputObjectTypeLike(mangledLike("GraphQLInputObjectType"))).toBe(true);
      expect(isListTypeLike(mangledLike("GraphQLList") as never)).toBe(true);
      expect(isNonNullTypeLike(mangledLike("GraphQLNonNull") as never)).toBe(true);
    });

    it("rejects unrelated tags", () => {
      expect(isScalarTypeLike(mangledLike("Something"))).toBe(false);
    });
  });

  // Older graphql-js (or a custom shim) may not expose Symbol.toStringTag.
  // Falling back to constructor.name preserves the cross-realm behaviour
  // introduced in #1056 for unminified consumers.
  describe("constructor.name fallback", () => {
    it("recognizes by constructor.name when no Symbol.toStringTag is present", () => {
      class GraphQLScalarType {
        readonly placeholder = true;
      }
      expect(isScalarTypeLike(new GraphQLScalarType())).toBe(true);
    });
  });
});

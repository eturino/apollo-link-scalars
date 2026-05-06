import { ApolloLink, type FetchResult, Observable, type Operation } from "@apollo/client/core";
import type { GraphQLLeafType, GraphQLSchema, NamedTypeNode, TypeNode } from "graphql";
import { GraphQLError } from "graphql/error/GraphQLError";
import type { FunctionsMap } from "../types/functions-map";
import type { NullFunctions } from "../types/null-functions";
import defaultNullFunctions from "./default-null-functions";
import { isInputTypeLike, isLeafTypeLike } from "./graphql-type-guards";
import { mapIfArray } from "./map-if-array";
import { isListTypeNode, isNonNullTypeNode, isOperationDefinitionNode } from "./node-types";
import { Serializer } from "./serializer";
import { treatResult } from "./treat-result";

interface ScalarApolloLinkParams {
  /**
   * The executable GraphQL schema the link uses to discover scalar and enum
   * types and walk operation/result trees. Required.
   *
   * Typically built with `@graphql-tools/schema`'s `makeExecutableSchema`,
   * `buildClientSchema` (from a saved introspection JSON), or any other
   * factory that produces a `GraphQLSchema`. The same schema instance is
   * used for both serialization (variables, on the way out) and parsing
   * (responses, on the way in), so leaf-type identity must be stable for
   * the lifetime of the link.
   *
   * The link reads `schema.getTypeMap()` once at construction time to build
   * its internal `functionsMap`; later mutations to the schema are not
   * picked up.
   */
  schema: GraphQLSchema;
  /**
   * Per-scalar (and per-enum) overrides for `serialize` / `parseValue` /
   * `parseLiteral`. Optional. Keys are GraphQL type names; values are
   * partial implementations that override whatever the schema's own scalar
   * resolvers do.
   *
   * Use this to plug in custom client-side representations — e.g. a `Date`
   * scalar that parses to a JavaScript `Date` object on the way in and
   * serializes to a custom ISO string on the way out, even when the
   * server-side schema only defines a generic string scalar.
   *
   * Entries here are merged on top of the leaf types extracted from
   * `schema.getTypeMap()`, so a `typesMap` entry for `Date` wins over the
   * schema's own `Date` definition. Leaf types not mentioned in
   * `typesMap` keep their schema-defined behavior.
   */
  typesMap?: FunctionsMap;
  /**
   * Validate enum values when parsing responses. Default `false`.
   *
   * When enabled, the link checks every enum-typed field in the response
   * against the schema's known values for that enum and throws a
   * `GraphQLError` if the server returns an unknown value. Useful as an
   * early-warning when your client schema drifts behind the server's, at
   * the cost of one extra `Set.has` per enum field.
   *
   * When disabled (the default) unknown enum values pass through untouched.
   */
  validateEnums?: boolean;
  /**
   * Strip `__typename` from input objects before they are serialized as
   * variables. Default `false`.
   *
   * Useful when you read an object out of the cache (which carries
   * `__typename` for normalization) and pass it back as an input to
   * another query or mutation: most servers reject the extra field. When
   * enabled, the link removes `__typename` recursively from every input
   * object referenced by an operation's variable definitions.
   *
   * Has no effect on response parsing.
   */
  removeTypenameFromInputs?: boolean;
  /**
   * Hooks for handling `null` values during serialization and parsing.
   * Optional.
   *
   * Defaults to identity functions (`null -> null`, `value -> value`),
   * matching the behavior of the underlying GraphQL spec. Override this to
   * box/unbox nullable values into a Maybe-like monad (e.g. `Just` /
   * `Nothing`) so that the entire client codebase can deal in
   * `Maybe<T>` without sprinkling explicit null checks.
   *
   * The shape is `{ serialize: (value) => unknown; parseValue: (value)
   * => unknown }`. `serialize` runs after the normal scalar serializer on
   * the way out (variables); `parseValue` runs after the normal parser on
   * the way in (response). The standard scalar serializer/parser is *not*
   * called for `null` values themselves — only `nullFunctions` runs. See
   * the README's "Changing the behaviour of nullable types" section for a
   * full example.
   */
  nullFunctions?: NullFunctions;
  /**
   * Opt-in fix for `BigInt`-typed variables. Default `false`.
   *
   * Apollo Client computes cache identity by calling `JSON.stringify` (via
   * its internal `canonicalStringify`) on the variables BEFORE the link
   * chain executes, so the link itself cannot intercept the call.
   * `JSON.stringify(1n)` throws because the JavaScript specification does
   * not define `BigInt.prototype.toJSON`. This surfaces as
   * `TypeError: Do not know how to serialize a BigInt` from
   * `QueryManager.readCache` (cache-first queries) or `markMutationResult`
   * (mutation cache writes).
   *
   * When this flag is `true`, the link installs the standard MDN-style
   * shim `BigInt.prototype.toJSON = function () { return this.toString(); }`
   * on first instantiation, but only if no `toJSON` is already defined.
   *
   * **Warnings — read before enabling.**
   *
   * - **Process-wide side effect.** The shim modifies `BigInt.prototype` for
   *   every `BigInt` in the runtime, not only the ones used as GraphQL
   *   variables. Code anywhere in the process that calls
   *   `JSON.stringify` on a `BigInt` will now produce a string (e.g.
   *   `JSON.stringify({ id: 1n })` returns `'{"id":"1"}'` instead of
   *   throwing). If your code relies on that throw as a guardrail this
   *   removes it.
   * - **No-op when `toJSON` already exists.** If your app, another library,
   *   or a polyfill has already defined `BigInt.prototype.toJSON` (for
   *   example the envelope shape `{ $bigint: "..." }`), the existing
   *   implementation is left untouched. Safe to combine, but the shape of
   *   `BigInt` values in `JSON.stringify` output is whatever was installed
   *   first. Install your own shim before constructing the link if you
   *   need a different shape.
   * - **Wire vs. cache identity.** The shim only governs how Apollo
   *   computes local cache keys. The wire format sent to your GraphQL
   *   server is still produced by the `serialize` function registered for
   *   the `BigInt` scalar in `typesMap`. The two are independent.
   * - **Why `toString` and not the envelope.** The envelope variant
   *   `{ $bigint: "..." }` documented on MDN is for JS-to-JS JSON
   *   round-trips and is not safe as a GraphQL wire shape. If a `BigInt`
   *   leaks past `typesMap.BigInt.serialize` (e.g. from a misconfigured
   *   scalar) the `toString` form surfaces as a plain string the server
   *   will usually still accept; the envelope form would surface as a
   *   malformed object.
   * - **Only `BigInt`.** This option does not address `Symbol` values,
   *   functions, or circular references in variables.
   */
  ensureSerializableVariables?: boolean;
}

// Forward-function shape that is structurally compatible with both
// v3 `NextLink` and v4 `ApolloLink.ForwardFunction`.
type ForwardFn = (operation: Operation) => Observable<FetchResult> | null;

// Structural subscription type that covers both v3 zen-observable `Subscription`
// and v4 rxjs `Subscription`. We only ever call `unsubscribe()` on it.
interface LinkSubscription {
  unsubscribe(): void;
}

export class ScalarApolloLink extends ApolloLink {
  public readonly schema: GraphQLSchema;
  public readonly typesMap: FunctionsMap;
  public readonly validateEnums: boolean;
  public readonly removeTypenameFromInputs: boolean;
  public readonly ensureSerializableVariables: boolean;
  public readonly functionsMap: FunctionsMap;
  public readonly serializer: Serializer;
  public readonly nullFunctions: NullFunctions;

  constructor(pars: ScalarApolloLinkParams) {
    super();
    this.schema = pars.schema;
    this.typesMap = pars.typesMap ?? {};
    this.validateEnums = pars.validateEnums ?? false;
    this.removeTypenameFromInputs = pars.removeTypenameFromInputs ?? false;
    this.ensureSerializableVariables = pars.ensureSerializableVariables ?? false;
    this.nullFunctions = pars.nullFunctions ?? defaultNullFunctions;

    if (this.ensureSerializableVariables) {
      installBigIntJsonShim();
    }

    const leafTypesMap: Record<string, GraphQLLeafType> = {};
    for (const [key, value] of Object.entries(this.schema.getTypeMap())) {
      if (isLeafTypeLike(value)) {
        leafTypesMap[key] = value;
      }
    }
    this.functionsMap = { ...leafTypesMap, ...this.typesMap };
    this.serializer = new Serializer(this.schema, this.functionsMap, this.removeTypenameFromInputs, this.nullFunctions);
  }

  // ApolloLink code based on https://github.com/with-heart/apollo-link-response-resolver
  // forward is optional to stay compatible with v3's `forward?: NextLink`.
  // v4 requires it, but a wider signature is still assignable to v4's parent.
  public request(givenOperation: Operation, forward?: ForwardFn): Observable<FetchResult> {
    const operation = this.cleanVariables(givenOperation);

    return new Observable((observer) => {
      let sub: LinkSubscription | undefined;

      try {
        if (!forward) {
          observer.complete();
          return;
        }
        const forwarded = forward(operation);
        if (!forwarded) {
          observer.complete();
          return;
        }
        sub = forwarded.subscribe({
          next: (result) => {
            try {
              observer.next(this.parse(operation, result));
            } catch (treatError) {
              const errors = result.errors ? [...result.errors] : [];
              if (treatError instanceof GraphQLError) {
                errors.push(treatError);
              }
              observer.next({ errors });
            }
          },
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });
      } catch (e) {
        observer.error(e);
      }

      return () => {
        if (sub) sub.unsubscribe();
      };
    });
  }

  protected parse(operation: Operation, result: FetchResult): FetchResult {
    return treatResult({
      operation,
      result,
      functionsMap: this.functionsMap,
      schema: this.schema,
      validateEnums: this.validateEnums,
      nullFunctions: this.nullFunctions,
    });
  }

  /**
   * Detach and serialize the operation variables without mutating the caller's
   * original variables object, so Apollo can keep using it for cache identity.
   * @param operation
   */
  protected cleanVariables(operation: Operation): Operation {
    operation.variables = { ...operation.variables };

    const o = operation.query.definitions.find(isOperationDefinitionNode);
    const varDefs = o?.variableDefinitions ?? [];
    varDefs.forEach((vd) => {
      const key = vd.variable.name.value;
      operation.variables[key] = this.serialize(operation.variables[key], vd.type);
    });
    return operation;
  }

  protected serialize(value: any, typeNode: TypeNode): any {
    if (isNonNullTypeNode(typeNode)) {
      return this.serialize(value, typeNode.type);
    }

    if (isListTypeNode(typeNode)) {
      return mapIfArray(value, (v) => this.serialize(v, typeNode.type));
    }

    return this.serializeNamed(value, typeNode);
  }

  protected serializeNamed(value: any, typeNode: NamedTypeNode): any {
    const typeName = typeNode.name.value;
    const schemaType = this.schema.getType(typeName);

    return schemaType && isInputTypeLike(schemaType) ? this.serializer.serialize(value, schemaType) : value;
  }
}

export const withScalars = (pars: ScalarApolloLinkParams): ApolloLink => {
  return new ScalarApolloLink(pars);
};

function installBigIntJsonShim(): void {
  const proto = BigInt.prototype as unknown as { toJSON?: () => string };
  if (typeof proto.toJSON === "function") {
    return;
  }
  Object.defineProperty(BigInt.prototype, "toJSON", {
    value: function (this: bigint) {
      return this.toString();
    },
    configurable: true,
    writable: true,
    enumerable: false,
  });
}

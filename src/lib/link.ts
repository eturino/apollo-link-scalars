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
  schema: GraphQLSchema;
  typesMap?: FunctionsMap;
  validateEnums?: boolean;
  removeTypenameFromInputs?: boolean;
  nullFunctions?: NullFunctions;
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
  public readonly functionsMap: FunctionsMap;
  public readonly serializer: Serializer;
  public readonly nullFunctions: NullFunctions;

  constructor(pars: ScalarApolloLinkParams) {
    super();
    this.schema = pars.schema;
    this.typesMap = pars.typesMap ?? {};
    this.validateEnums = pars.validateEnums ?? false;
    this.removeTypenameFromInputs = pars.removeTypenameFromInputs ?? false;
    this.nullFunctions = pars.nullFunctions ?? defaultNullFunctions;

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

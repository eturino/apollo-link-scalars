import { ApolloLink, FetchResult, NextLink, Observable, Operation } from "@apollo/client";
import { GraphQLSchema, isInputType, isLeafType, NamedTypeNode, TypeNode } from "graphql";
import { pickBy } from "lodash";
import { ZenObservable } from "zen-observable-ts";
import { FunctionsMap } from "..";
import { mapIfArray } from "./map-if-array";
import { isListTypeNode, isNonNullTypeNode, isOperationDefinitionNode } from "./node-types";
import { Serializer } from "./serializer";
import { treatResult } from "./treat-result";

type ScalarApolloLinkParams = {
  schema: GraphQLSchema;
  typesMap?: FunctionsMap;
  validateEnums?: boolean;
  removeTypenameFromInputs?: boolean;
};

export class ScalarApolloLink extends ApolloLink {
  public readonly schema: GraphQLSchema;
  public readonly typesMap: FunctionsMap;
  public readonly validateEnums: boolean;
  public readonly removeTypenameFromInputs: boolean;
  public readonly functionsMap: FunctionsMap;
  public readonly serializer: Serializer;

  constructor(pars: ScalarApolloLinkParams) {
    super();
    this.schema = pars.schema;
    this.typesMap = pars.typesMap || {};
    this.validateEnums = pars.validateEnums || false;
    this.removeTypenameFromInputs = pars.removeTypenameFromInputs || false;

    const leafTypesMap = pickBy(this.schema.getTypeMap(), isLeafType);
    this.functionsMap = { ...leafTypesMap, ...this.typesMap };
    this.serializer = new Serializer(this.schema, this.functionsMap, this.removeTypenameFromInputs);
  }

  // ApolloLink code based on https://github.com/with-heart/apollo-link-response-resolver
  public request(givenOperation: Operation, forward: NextLink): Observable<FetchResult> | null {
    const operation = this.cleanVariables(givenOperation);

    return new Observable((observer) => {
      let sub: ZenObservable.Subscription;

      try {
        sub = forward(operation).subscribe({
          next: (result) => {
            try {
              observer.next(this.parse(operation, result));
            } catch (treatError) {
              const errors = result.errors || [];
              observer.next({ errors: [...errors, treatError] });
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
    });
  }

  /**
   * mutate the operation object with the serialized variables
   * @param operation
   */
  protected cleanVariables(operation: Operation): Operation {
    const o = operation.query.definitions.find(isOperationDefinitionNode);
    const varDefs = (o && o.variableDefinitions) || [];
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

    return schemaType && isInputType(schemaType) ? this.serializer.serialize(value, schemaType) : value;
  }
}

export const withScalars = (pars: ScalarApolloLinkParams): ApolloLink => {
  return new ScalarApolloLink(pars);
};

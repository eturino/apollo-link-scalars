import { FetchResult, Operation } from "@apollo/client/core";
import { GraphQLObjectType, GraphQLSchema, OperationDefinitionNode } from "graphql";
import { FunctionsMap } from "..";
import { NullFunctions } from "../types/null-functions";
import { fragmentReducer } from "./fragment-reducer";
import { isFieldNode } from "./node-types";
import { Parser } from "./parser";

function rootTypeFor(
  operationDefinitionNode: OperationDefinitionNode,
  schema: GraphQLSchema
): GraphQLObjectType | null {
  if (operationDefinitionNode.operation === "query") {
    return schema.getQueryType() || null;
  }

  if (operationDefinitionNode.operation === "mutation") {
    return schema.getMutationType() || null;
  }

  if (operationDefinitionNode.operation === "subscription") {
    return schema.getSubscriptionType() || null;
  }

  return null;
}

type TreatResultParams = {
  schema: GraphQLSchema;
  functionsMap: FunctionsMap;
  operation: Operation;
  result: FetchResult;
  validateEnums: boolean;
  nullFunctions: NullFunctions;
};

export function treatResult({
  schema,
  functionsMap,
  operation,
  result,
  validateEnums,
  nullFunctions,
}: TreatResultParams): FetchResult {
  const data = result.data;
  if (!data) return result;

  const operationDefinitionNode = fragmentReducer(operation.query);
  if (!operationDefinitionNode) return result;

  const rootType = rootTypeFor(operationDefinitionNode, schema);
  if (!rootType) return result;

  const parser = new Parser(schema, functionsMap, validateEnums, nullFunctions);
  const rootSelections = operationDefinitionNode.selectionSet.selections.filter(isFieldNode);
  const newData = parser.parseObjectWithSelections(data, rootType, rootSelections);
  return { ...result, data: newData };
}

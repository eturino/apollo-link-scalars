import { FetchResult, Operation } from "apollo-link";
import {
  FieldNode,
  getNullableType,
  GraphQLFieldMap,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  isScalarType,
  OperationDefinitionNode
} from "graphql";
import { FunctionsMap } from "..";
import { fragmentReducer } from "./fragment-reducer";
import { isFieldNode } from "./node-types";

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

type Data = { [key: string]: any };

class Parser {
  constructor(
    readonly schema: GraphQLSchema,
    readonly functionsMap: FunctionsMap
  ) {}

  public parseResponseData(
    data: Data,
    rootType: GraphQLObjectType,
    rootSelections: FieldNode[]
  ): Data {
    return this.parseObject(data, rootType, rootSelections);
  }

  protected parseObject(
    data: Data,
    type: GraphQLObjectType,
    selections: FieldNode[]
  ): Data {
    const fieldMap = type.getFields();
    return selections.reduce(
      (acc, fn) => this.treatSelection(acc, fieldMap, fn),
      data
    );
  }

  protected treatSelection(
    data: Data,
    fieldMap: GraphQLFieldMap<any, any, any>,
    fieldNode: FieldNode
  ): Data {
    const name = fieldNode.name.value;
    const field = fieldMap[name];
    if (!field) return data;
    const type = getNullableType(field.type);

    const key = fieldNode.alias ? fieldNode.alias.value : fieldNode.name.value;
    if (isScalarType(type)) {
      data[key] = this.parseScalar(data[key], type);
      return data;
    }

    // TODO: the rest
    return data;
  }

  protected parseScalar(value: any, type: GraphQLScalarType) {
    const fns = this.functionsMap[type.name] || type;
    return fns.parseValue(value);
  }
}

export function treatResult(
  schema: GraphQLSchema,
  functionsMap: FunctionsMap,
  operation: Operation,
  response: FetchResult
): FetchResult {
  const data = response.data;
  if (!data) return response;

  const operationDefinitionNode = fragmentReducer(operation.query);
  if (!operationDefinitionNode) return response;

  const rootType = rootTypeFor(operationDefinitionNode, schema);
  if (!rootType) return response;

  const parser = new Parser(schema, functionsMap);
  const rootSelections = operationDefinitionNode.selectionSet.selections.filter(
    isFieldNode
  );
  const newData = parser.parseResponseData(data, rootType, rootSelections);
  return { ...response, data: newData };
}

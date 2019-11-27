import { FetchResult, Operation } from "apollo-link";
import {
  FieldNode,
  getNullableType,
  GraphQLEnumType,
  GraphQLError,
  GraphQLFieldMap,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  isEnumType,
  isNonNullType,
  isScalarType,
  OperationDefinitionNode
} from "graphql";
import { isNull, isUndefined } from "lodash";
import { FunctionsMap } from "..";
import { fragmentReducer } from "./fragment-reducer";
import { isFieldNode } from "./node-types";

function isNone(x: any): x is null | undefined {
  return isUndefined(x) || isNull(x);
}

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
    readonly functionsMap: FunctionsMap,
    readonly validateEnums: boolean
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

    const key = fieldNode.alias ? fieldNode.alias.value : fieldNode.name.value;

    if (isNonNullType(field.type) && isNone(data[key])) {
      const where = fieldNode.alias
        ? `"${fieldNode.name.value}" (alias "${fieldNode.alias.value}")`
        : `"${fieldNode.name.value}"`;
      throw new GraphQLError(`non-null field ${where} with null value`);
    }

    const type = getNullableType(field.type);

    if (isScalarType(type)) {
      data[key] = this.parseScalar(data[key], type);
      return data;
    }

    if (isEnumType(type)) {
      this.validateEnum(data[key], type);
      return data;
    }

    // TODO: the rest
    return data;
  }

  protected parseScalar(value: any, type: GraphQLScalarType): any {
    const fns = this.functionsMap[type.name] || type;
    return fns.parseValue(value);
  }

  protected validateEnum(value: any, type: GraphQLEnumType): void {
    if (!this.validateEnums || !value) return;

    const enumValues = type.getValues().map(v => v.value);
    if (!enumValues.includes(value)) {
      throw new GraphQLError(`enum "${type.name}" with invalid value`);
    }
  }
}

export function treatResult(
  schema: GraphQLSchema,
  functionsMap: FunctionsMap,
  operation: Operation,
  response: FetchResult,
  validateEnums: boolean
): FetchResult {
  const data = response.data;
  if (!data) return response;

  const operationDefinitionNode = fragmentReducer(operation.query);
  if (!operationDefinitionNode) return response;

  const rootType = rootTypeFor(operationDefinitionNode, schema);
  if (!rootType) return response;

  const parser = new Parser(schema, functionsMap, validateEnums);
  const rootSelections = operationDefinitionNode.selectionSet.selections.filter(
    isFieldNode
  );
  const newData = parser.parseResponseData(data, rootType, rootSelections);
  return { ...response, data: newData };
}

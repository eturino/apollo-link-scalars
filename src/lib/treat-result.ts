import { FetchResult, Operation } from "apollo-link";
import {
  FieldNode,
  getNullableType,
  GraphQLEnumType,
  GraphQLError,
  GraphQLFieldMap,
  GraphQLNullableType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLSchema,
  isEnumType,
  isListType,
  isNonNullType,
  isScalarType,
  OperationDefinitionNode
} from "graphql";
import { isArray, isNull, isUndefined } from "lodash";
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

    return this.treatType(data, key, field.type, fieldNode);
  }

  protected treatType(
    data: Data,
    key: string,
    type: GraphQLOutputType,
    fieldNode: FieldNode
  ): Data {
    data[key] = this.treatValue(data[key], type, fieldNode);
    return data;
  }

  protected treatValue(
    value: any,
    givenType: GraphQLOutputType,
    fieldNode: FieldNode
  ): any {
    const type = this.ensureNullableType(value, givenType, fieldNode);
    if (isScalarType(type)) {
      return this.parseScalar(value, type);
    }

    if (isEnumType(type)) {
      this.validateEnum(value, type);
      return value;
    }

    if (isNone(value)) return value;

    if (isListType(type)) {
      const innerType: GraphQLOutputType = type.ofType;
      return isArray(value)
        ? value.map(v => this.treatValue(v, innerType, fieldNode))
        : value;
    }

    // TODO: the rest
    return value;
  }

  protected ensureNullableType(
    value: any,
    type: GraphQLOutputType,
    fieldNode: FieldNode
  ): GraphQLNullableType {
    if (isNonNullType(type) && isNone(value)) {
      this.failNull(fieldNode);
    }

    return getNullableType(type);
  }

  protected failNull(fieldNode: FieldNode): void {
    const where = fieldNode.alias
      ? `"${fieldNode.name.value}" (alias "${fieldNode.alias.value}")`
      : `"${fieldNode.name.value}"`;
    throw new GraphQLError(`non-null field ${where} with null value`);
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

type TreatResultParams = {
  schema: GraphQLSchema;
  functionsMap: FunctionsMap;
  operation: Operation;
  result: FetchResult;
  validateEnums: boolean;
};

export function treatResult({
  schema,
  functionsMap,
  operation,
  result,
  validateEnums
}: TreatResultParams): FetchResult {
  const data = result.data;
  if (!data) return result;

  const operationDefinitionNode = fragmentReducer(operation.query);
  if (!operationDefinitionNode) return result;

  const rootType = rootTypeFor(operationDefinitionNode, schema);
  if (!rootType) return result;

  const parser = new Parser(schema, functionsMap, validateEnums);
  const rootSelections = operationDefinitionNode.selectionSet.selections.filter(
    isFieldNode
  );
  const newData = parser.parseResponseData(data, rootType, rootSelections);
  return { ...result, data: newData };
}

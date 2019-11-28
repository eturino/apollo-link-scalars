import {
  FieldNode,
  getNullableType,
  GraphQLEnumType,
  GraphQLError,
  GraphQLFieldMap,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNullableType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLUnionType,
  isEnumType,
  isListType,
  isNonNullType,
  isScalarType
} from "graphql";
import { isArray } from "lodash";
import { FunctionsMap } from "..";
import { isNone } from "./is-none";

type Data = { [key: string]: any };

function ensureNullableType(
  value: any,
  type: GraphQLOutputType,
  fieldNode: FieldNode
): GraphQLNullableType {
  if (isNonNullType(type) && isNone(value)) {
    const where = fieldNode.alias
      ? `"${fieldNode.name.value}" (alias "${fieldNode.alias.value}")`
      : `"${fieldNode.name.value}"`;
    throw new GraphQLError(`non-null field ${where} with null value`);
  }

  return getNullableType(type);
}

export class Parser {
  constructor(
    readonly schema: GraphQLSchema,
    readonly functionsMap: FunctionsMap,
    readonly validateEnums: boolean
  ) {}

  public parseObjectWithSelections(
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

    data[key] = this.treatValue(data[key], field.type, fieldNode);
    return data;
  }

  protected treatValue(
    value: any,
    givenType: GraphQLOutputType,
    fieldNode: FieldNode
  ): any {
    const type = ensureNullableType(value, givenType, fieldNode);
    if (isScalarType(type)) {
      return this.parseScalar(value, type);
    }

    if (isEnumType(type)) {
      this.validateEnum(value, type);
      return value;
    }

    if (isNone(value)) return value;

    if (isListType(type)) {
      return this.parseArray(value, type, fieldNode);
    }

    return this.parseNestedObject(value, type, fieldNode);
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

  protected parseArray(
    value: any,
    type: GraphQLList<GraphQLOutputType>,
    fieldNode: FieldNode
  ): any {
    const innerType: GraphQLOutputType = type.ofType;
    return isArray(value)
      ? value.map(v => this.treatValue(v, innerType, fieldNode))
      : value;
  }

  protected parseNestedObject(
    value: any,
    _type:
      | GraphQLObjectType<any, any, Data>
      | GraphQLInterfaceType
      | GraphQLUnionType
      | GraphQLInputObjectType,
    _fieldNode: FieldNode
  ): any {
    return value;
  }
}

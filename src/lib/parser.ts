import {
  FieldNode,
  getNullableType,
  GraphQLEnumType,
  GraphQLError,
  GraphQLFieldMap,
  GraphQLInputFieldMap,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLList,
  GraphQLNullableType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLSchema,
  isEnumType,
  isInputObjectType,
  isListType,
  isNonNullType,
  isObjectType,
  isScalarType
} from "graphql";
import { isArray, reduce } from "lodash";
import { FunctionsMap } from "..";
import { MutOrRO } from "../types/mut-or-ro";
import { isNone } from "./is-none";
import { ReducedFieldNode } from "./node-types";

type Data = { [key: string]: any };

function ensureNullableType(
  value: any,
  type: GraphQLOutputType | GraphQLInputType,
  fieldNode: FieldNode
): GraphQLNullableType {
  if (!isNonNullType(type)) return type;

  if (isNone(value)) {
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
    type: GraphQLObjectType | GraphQLInputObjectType,
    selections: MutOrRO<ReducedFieldNode[]>
  ): Data {
    const fieldMap = type.getFields();
    const fn = (d: Data, fieldNode: ReducedFieldNode) =>
      this.treatSelection(d, fieldMap, fieldNode);
    return reduce(selections, fn, data);
  }

  protected treatSelection(
    data: Data,
    fieldMap: GraphQLInputFieldMap | GraphQLFieldMap<any, any, any>,
    fieldNode: ReducedFieldNode
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
    givenType: GraphQLOutputType | GraphQLInputType,
    fieldNode: ReducedFieldNode
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

    return this.parseNestedObject(value, fieldNode);
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
    fieldNode: ReducedFieldNode
  ): any {
    return isArray(value)
      ? value.map(v => this.treatValue(v, type.ofType, fieldNode))
      : value;
  }

  protected parseNestedObject(value: any, fieldNode: ReducedFieldNode): any {
    if (
      !value ||
      !fieldNode ||
      !fieldNode.selectionSet ||
      !fieldNode.selectionSet.selections.length
    ) {
      return value;
    }
    const type = value.__typename
      ? this.schema.getType(value.__typename)
      : null;
    if (!type || (!isInputObjectType(type) && !isObjectType(type))) {
      return value;
    }

    return this.parseObjectWithSelections(
      value,
      type,
      fieldNode.selectionSet.selections
    );
  }
}

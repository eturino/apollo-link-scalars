import {
  GraphQLEnumType,
  GraphQLError,
  GraphQLFieldMap,
  GraphQLInputFieldMap,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNullableType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLUnionType,
  isEnumType,
  isInputObjectType,
  isListType,
  isNonNullType,
  isObjectType,
  isScalarType,
} from "graphql";
import reduce from "lodash.reduce";
import { FunctionsMap } from "..";
import { MutOrRO } from "../types/mut-or-ro";
import { NullFunctions } from "../types/null-functions";
import { isNone } from "./is-none";
import { ReducedFieldNode } from "./node-types";

type Data = { [key: string]: any };

function ensureNullable(type: GraphQLOutputType | GraphQLInputType): GraphQLNullableType {
  return isNonNullType(type) ? type.ofType : type;
}

export class Parser {
  constructor(
    readonly schema: GraphQLSchema,
    readonly functionsMap: FunctionsMap,
    readonly validateEnums: boolean,
    readonly nullFunctions: NullFunctions
  ) {}

  public parseObjectWithSelections(
    data: Data,
    type: GraphQLObjectType | GraphQLInputObjectType,
    selections: MutOrRO<ReducedFieldNode[]>
  ): Data {
    const fieldMap = type.getFields();
    const fn = (d: Data, fieldNode: ReducedFieldNode) => this.treatSelection(d, fieldMap, fieldNode);
    return reduce(selections, fn, data);
  }

  protected treatSelection(
    data: Data,
    fieldMap: GraphQLInputFieldMap | GraphQLFieldMap<any, any>,
    fieldNode: ReducedFieldNode
  ): Data {
    const name = fieldNode.name.value;
    const field = fieldMap[name];
    if (!field) return data;

    const key = fieldNode.alias ? fieldNode.alias.value : fieldNode.name.value;

    data[key] = this.treatValue(data[key], field.type, fieldNode);
    return data;
  }

  protected treatValue(value: any, givenType: GraphQLOutputType | GraphQLInputType, fieldNode: ReducedFieldNode): any {
    if (isNonNullType(givenType)) {
      return this.treatValueInternal(value, givenType, fieldNode);
    } else {
      return this.treatValueNullable(value, givenType, fieldNode);
    }
  }

  protected treatValueNullable(
    value: any,
    givenType: GraphQLOutputType | GraphQLInputType,
    fieldNode: ReducedFieldNode
  ): any {
    const wrappedValue = this.treatValueInternal(value, givenType, fieldNode);
    return this.nullFunctions.parseValue(wrappedValue);
  }

  protected treatValueInternal(
    value: any,
    givenType: GraphQLOutputType | GraphQLInputType,
    fieldNode: ReducedFieldNode
  ): any {
    const type = ensureNullable(givenType);

    if (isNone(value)) return value;

    if (isScalarType(type)) {
      return this.parseScalar(value, type);
    }

    if (isEnumType(type)) {
      this.validateEnum(value, type);
      return value;
    }

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

    const enumValues = type.getValues().map((v) => v.value);
    if (!enumValues.includes(value)) {
      throw new GraphQLError(`enum "${type.name}" with invalid value`);
    }
  }

  protected parseArray(value: any, type: GraphQLList<GraphQLOutputType>, fieldNode: ReducedFieldNode): any {
    return Array.isArray(value) ? value.map((v) => this.treatValue(v, type.ofType, fieldNode)) : value;
  }

  protected parseNestedObject(
    value: any,
    givenType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType | GraphQLInputObjectType,
    fieldNode: ReducedFieldNode
  ): any {
    if (!value || !fieldNode || !fieldNode.selectionSet || !fieldNode.selectionSet.selections.length) {
      return value;
    }

    const type = this.getObjectTypeFrom(value, givenType);

    return type ? this.parseObjectWithSelections(value, type, fieldNode.selectionSet.selections) : value;
  }

  protected getObjectTypeFrom(
    value: any,
    type: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType | GraphQLInputObjectType
  ): GraphQLObjectType | GraphQLInputObjectType | null {
    if (isInputObjectType(type) || isObjectType(type)) return type;
    if (!value.__typename) return null;

    const valueType = this.schema.getType(value.__typename);
    return isInputObjectType(valueType) || isObjectType(valueType) ? valueType : null;
  }
}

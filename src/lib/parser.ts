import {
  type GraphQLEnumType,
  GraphQLError,
  type GraphQLFieldMap,
  type GraphQLInputFieldMap,
  type GraphQLInputObjectType,
  type GraphQLInterfaceType,
  type GraphQLList,
  type GraphQLNullableType,
  type GraphQLObjectType,
  type GraphQLScalarType,
  type GraphQLSchema,
  type GraphQLType,
  type GraphQLUnionType,
} from "graphql";
import type { FunctionsMap } from "../types/functions-map";
import type { MutOrRO } from "../types/mut-or-ro";
import type { NullFunctions } from "../types/null-functions";
import {
  ensureNullableTypeLike,
  isEnumTypeLike,
  isInputObjectTypeLike,
  isListTypeLike,
  isNonNullTypeLike,
  isObjectTypeLike,
  isScalarTypeLike,
} from "./graphql-type-guards";
import { isNone } from "./is-none";
import type { ReducedFieldNode } from "./node-types";

type Data = Record<string, any>;

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
    for (const s of selections) {
      data = this.treatSelection(data, fieldMap, s);
    }
    return data;
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

  protected treatValue(value: any, givenType: GraphQLType, fieldNode: ReducedFieldNode): any {
    if (isNonNullTypeLike(givenType)) {
      return this.treatValueInternal(value, givenType, fieldNode);
    } else {
      return this.treatValueNullable(value, givenType, fieldNode);
    }
  }

  protected treatValueNullable(value: any, givenType: GraphQLType, fieldNode: ReducedFieldNode): any {
    const wrappedValue = this.treatValueInternal(value, givenType, fieldNode);
    return this.nullFunctions.parseValue(wrappedValue);
  }

  protected treatValueInternal(value: any, givenType: GraphQLType, fieldNode: ReducedFieldNode): any {
    const type: GraphQLNullableType = ensureNullableTypeLike(givenType);

    if (isNone(value)) return value;

    if (isScalarTypeLike(type)) {
      return this.parseScalar(value, type);
    }

    if (isEnumTypeLike(type)) {
      this.validateEnum(value, type, fieldNode);
      return value;
    }

    if (isListTypeLike(type)) {
      return this.parseArray(value, type, fieldNode);
    }

    return this.parseNestedObject(value, type, fieldNode);
  }

  protected parseScalar(value: any, type: GraphQLScalarType): any {
    const fns = this.functionsMap[type.name] ?? type;
    return fns.parseValue(value);
  }

  protected validateEnum(value: any, type: GraphQLEnumType, fieldNode: ReducedFieldNode): void {
    if (!this.validateEnums || !value) return;

    const allowedValues = type.getValues().map((v) => v.value);
    if (allowedValues.includes(value)) return;

    const fieldName = fieldNode.alias?.value ?? fieldNode.name.value;
    const allowedList = allowedValues.map((v) => JSON.stringify(v)).join(", ");
    throw new GraphQLError(
      `enum "${type.name}" with invalid value ${JSON.stringify(value)} at field "${fieldName}". Allowed values: ${allowedList}`,
      {
        nodes: [fieldNode],
        extensions: {
          code: "INVALID_ENUM_VALUE",
          typeName: type.name,
          fieldName,
          invalidValue: value,
          allowedValues,
        },
      }
    );
  }

  protected parseArray(value: any, type: GraphQLList<GraphQLType>, fieldNode: ReducedFieldNode): any {
    return Array.isArray(value) ? value.map((v) => this.treatValue(v, type.ofType, fieldNode)) : value;
  }

  protected parseNestedObject(
    value: any,
    givenType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType | GraphQLInputObjectType,
    fieldNode: ReducedFieldNode
  ): any {
    if (!value || !fieldNode.selectionSet?.selections.length) {
      return value;
    }

    const type = this.getObjectTypeFrom(value, givenType);

    return type ? this.parseObjectWithSelections(value, type, fieldNode.selectionSet.selections) : value;
  }

  protected getObjectTypeFrom(
    value: any,
    type: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType | GraphQLInputObjectType
  ): GraphQLObjectType | GraphQLInputObjectType | null {
    if (isInputObjectTypeLike(type) || isObjectTypeLike(type)) return type;
    if (!value.__typename) return null;

    const valueType = this.schema.getType(value.__typename);
    return isInputObjectTypeLike(valueType) || isObjectTypeLike(valueType) ? valueType : null;
  }
}

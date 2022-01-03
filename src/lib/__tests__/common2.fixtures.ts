import { DocumentNode, Kind, OperationDefinitionNode, OperationTypeNode } from "graphql";

export const operationQuery: DocumentNode = {
  kind: Kind.DOCUMENT,
  definitions: [
    {
      kind: Kind.OPERATION_DEFINITION,
      operation: OperationTypeNode.QUERY,
      name: { kind: Kind.NAME, value: "GetClients" },
      variableDefinitions: [],
      directives: [],
      selectionSet: {
        kind: Kind.SELECTION_SET,
        selections: [
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "clients" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: [
                {
                  kind: Kind.FRAGMENT_SPREAD,
                  name: { kind: Kind.NAME, value: "Client" },
                  directives: [],
                },
                { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
              ],
            },
          },
          {
            kind: Kind.FIELD,
            alias: { kind: Kind.NAME, value: "more" },
            name: { kind: Kind.NAME, value: "clients" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: [
                {
                  kind: Kind.FRAGMENT_SPREAD,
                  name: { kind: Kind.NAME, value: "Client" },
                  directives: [],
                },
                { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
              ],
            },
          },
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "now" },
            arguments: [],
            directives: [],
          },
          {
            kind: Kind.FIELD,
            alias: { kind: Kind.NAME, value: "what" },
            name: { kind: Kind.NAME, value: "now" },
            arguments: [],
            directives: [],
          },
        ],
      },
    },
    {
      kind: Kind.FRAGMENT_DEFINITION,
      name: { kind: Kind.NAME, value: "Client" },
      typeCondition: {
        kind: Kind.NAMED_TYPE,
        name: { kind: Kind.NAME, value: "Client" },
      },
      directives: [],
      selectionSet: {
        kind: Kind.SELECTION_SET,
        selections: [
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "id" },
            arguments: [],
            directives: [],
          },
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "clientKey" },
            arguments: [],
            directives: [],
          },
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "name" },
            arguments: [],
            directives: [],
          },
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "status" },
            arguments: [],
            directives: [],
          },
          { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
        ],
      },
    },
  ],
  // loc: { start: 0, end: 205 }
};

// 1. resolve fragments
export const expectedFragmentsReduced: OperationDefinitionNode = {
  kind: Kind.OPERATION_DEFINITION,
  operation: OperationTypeNode.QUERY,
  name: { kind: Kind.NAME, value: "GetClients" },
  variableDefinitions: [],
  directives: [],
  selectionSet: {
    kind: Kind.SELECTION_SET,
    selections: [
      {
        kind: Kind.FIELD,
        name: { kind: Kind.NAME, value: "clients" },
        arguments: [],
        directives: [],
        selectionSet: {
          kind: Kind.SELECTION_SET,
          selections: [
            {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: "id" },
              arguments: [],
              directives: [],
            },
            {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: "clientKey" },
              arguments: [],
              directives: [],
            },
            {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: "name" },
              arguments: [],
              directives: [],
            },
            {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: "status" },
              arguments: [],
              directives: [],
            },
            { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
          ],
        },
      },
      {
        kind: Kind.FIELD,
        alias: { kind: Kind.NAME, value: "more" },
        name: { kind: Kind.NAME, value: "clients" },
        arguments: [],
        directives: [],
        selectionSet: {
          kind: Kind.SELECTION_SET,
          selections: [
            {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: "id" },
              arguments: [],
              directives: [],
            },
            {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: "clientKey" },
              arguments: [],
              directives: [],
            },
            {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: "name" },
              arguments: [],
              directives: [],
            },
            {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: "status" },
              arguments: [],
              directives: [],
            },
            { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
          ],
        },
      },
      {
        kind: Kind.FIELD,
        name: { kind: Kind.NAME, value: "now" },
        arguments: [],
        directives: [],
      },
      {
        kind: Kind.FIELD,
        alias: { kind: Kind.NAME, value: "what" },
        name: { kind: Kind.NAME, value: "now" },
        arguments: [],
        directives: [],
      },
    ],
  },
};

import { DocumentNode, OperationDefinitionNode } from "graphql";

export const operationQuery: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetClients" },
      variableDefinitions: [],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "clients" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "Client" },
                  directives: [],
                },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
              ],
            },
          },
          {
            kind: "Field",
            alias: { kind: "Name", value: "more" },
            name: { kind: "Name", value: "clients" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "Client" },
                  directives: [],
                },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "now" },
            arguments: [],
            directives: [],
          },
          {
            kind: "Field",
            alias: { kind: "Name", value: "what" },
            name: { kind: "Name", value: "now" },
            arguments: [],
            directives: [],
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "Client" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Client" },
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "id" },
            arguments: [],
            directives: [],
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "clientKey" },
            arguments: [],
            directives: [],
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "name" },
            arguments: [],
            directives: [],
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "status" },
            arguments: [],
            directives: [],
          },
          { kind: "Field", name: { kind: "Name", value: "__typename" } },
        ],
      },
    },
  ],
  // loc: { start: 0, end: 205 }
};

// 1. resolve fragments
export const expectedFragmentsReduced: OperationDefinitionNode = {
  kind: "OperationDefinition",
  operation: "query",
  name: { kind: "Name", value: "GetClients" },
  variableDefinitions: [],
  directives: [],
  selectionSet: {
    kind: "SelectionSet",
    selections: [
      {
        kind: "Field",
        name: { kind: "Name", value: "clients" },
        arguments: [],
        directives: [],
        selectionSet: {
          kind: "SelectionSet",
          selections: [
            {
              kind: "Field",
              name: { kind: "Name", value: "id" },
              arguments: [],
              directives: [],
            },
            {
              kind: "Field",
              name: { kind: "Name", value: "clientKey" },
              arguments: [],
              directives: [],
            },
            {
              kind: "Field",
              name: { kind: "Name", value: "name" },
              arguments: [],
              directives: [],
            },
            {
              kind: "Field",
              name: { kind: "Name", value: "status" },
              arguments: [],
              directives: [],
            },
            { kind: "Field", name: { kind: "Name", value: "__typename" } },
          ],
        },
      },
      {
        kind: "Field",
        alias: { kind: "Name", value: "more" },
        name: { kind: "Name", value: "clients" },
        arguments: [],
        directives: [],
        selectionSet: {
          kind: "SelectionSet",
          selections: [
            {
              kind: "Field",
              name: { kind: "Name", value: "id" },
              arguments: [],
              directives: [],
            },
            {
              kind: "Field",
              name: { kind: "Name", value: "clientKey" },
              arguments: [],
              directives: [],
            },
            {
              kind: "Field",
              name: { kind: "Name", value: "name" },
              arguments: [],
              directives: [],
            },
            {
              kind: "Field",
              name: { kind: "Name", value: "status" },
              arguments: [],
              directives: [],
            },
            { kind: "Field", name: { kind: "Name", value: "__typename" } },
          ],
        },
      },
      {
        kind: "Field",
        name: { kind: "Name", value: "now" },
        arguments: [],
        directives: [],
      },
      {
        kind: "Field",
        alias: { kind: "Name", value: "what" },
        name: { kind: "Name", value: "now" },
        arguments: [],
        directives: [],
      },
    ],
  },
};

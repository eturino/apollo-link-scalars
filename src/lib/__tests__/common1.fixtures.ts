import { DocumentNode, OperationDefinitionNode } from "graphql";

export const operationQuery: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetClientDashboardFocus" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "clientKey" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
          directives: [],
        },
      ],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "client" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "clientKey" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "clientKey" },
                },
              },
            ],
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
            name: { kind: "Name", value: "visibleDashboards" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "clientKey" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "clientKey" },
                },
              },
            ],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "DashboardInfo" },
                  directives: [],
                },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "visibleFocusList" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "clientKey" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "clientKey" },
                },
              },
            ],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "Focus" },
                  directives: [],
                },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
              ],
            },
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
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "DashboardInfo" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Dashboard" },
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
            name: { kind: "Name", value: "dashboardKey" },
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
            name: { kind: "Name", value: "visibility" },
            arguments: [],
            directives: [],
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "description" },
            arguments: [],
            directives: [],
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "owner" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "UserProfile" },
                  directives: [],
                },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "UserProfile" },
                  directives: [],
                },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "__typename" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserProfile" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "UserProfile" },
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
            name: { kind: "Name", value: "email" },
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
            name: { kind: "Name", value: "nickname" },
            arguments: [],
            directives: [],
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "picture" },
            arguments: [],
            directives: [],
          },
          { kind: "Field", name: { kind: "Name", value: "__typename" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "Focus" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Focus" },
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
            name: { kind: "Name", value: "focusKey" },
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
            name: { kind: "Name", value: "visibility" },
            arguments: [],
            directives: [],
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "boardKeys" },
            arguments: [],
            directives: [],
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "peopleIds" },
            arguments: [],
            directives: [],
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "multiFilters" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "MultiFilter" },
                  directives: [],
                },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "boolFilters" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "BoolFilter" },
                  directives: [],
                },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "owner" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "UserProfile" },
                  directives: [],
                },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "UserProfile" },
                  directives: [],
                },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "__typename" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "MultiFilter" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "MultiFilter" },
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "key" },
            arguments: [],
            directives: [],
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "values" },
            arguments: [],
            directives: [],
          },
          { kind: "Field", name: { kind: "Name", value: "__typename" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "BoolFilter" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "BoolFilter" },
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "key" },
            arguments: [],
            directives: [],
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "value" },
            arguments: [],
            directives: [],
          },
          { kind: "Field", name: { kind: "Name", value: "__typename" } },
        ],
      },
    },
  ],
  // loc: { start: 0, end: 1171 }
};

// 1. resolve fragments
export const expectedFragmentsReduced: OperationDefinitionNode = {
  kind: "OperationDefinition",
  operation: "query",
  name: { kind: "Name", value: "GetClientDashboardFocus" },
  variableDefinitions: [
    {
      kind: "VariableDefinition",
      variable: {
        kind: "Variable",
        name: { kind: "Name", value: "clientKey" },
      },
      type: {
        kind: "NonNullType",
        type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
      },
      directives: [],
    },
  ],
  directives: [],
  selectionSet: {
    kind: "SelectionSet",
    selections: [
      {
        kind: "Field",
        name: { kind: "Name", value: "client" },
        arguments: [
          {
            kind: "Argument",
            name: { kind: "Name", value: "clientKey" },
            value: {
              kind: "Variable",
              name: { kind: "Name", value: "clientKey" },
            },
          },
        ],
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
        name: { kind: "Name", value: "visibleDashboards" },
        arguments: [
          {
            kind: "Argument",
            name: { kind: "Name", value: "clientKey" },
            value: {
              kind: "Variable",
              name: { kind: "Name", value: "clientKey" },
            },
          },
        ],
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
              name: { kind: "Name", value: "dashboardKey" },
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
              name: { kind: "Name", value: "visibility" },
              arguments: [],
              directives: [],
            },
            {
              kind: "Field",
              name: { kind: "Name", value: "description" },
              arguments: [],
              directives: [],
            },
            {
              kind: "Field",
              name: { kind: "Name", value: "owner" },
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
                    name: { kind: "Name", value: "email" },
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
                    name: { kind: "Name", value: "nickname" },
                    arguments: [],
                    directives: [],
                  },
                  {
                    kind: "Field",
                    name: { kind: "Name", value: "picture" },
                    arguments: [],
                    directives: [],
                  },
                  { kind: "Field", name: { kind: "Name", value: "__typename" } },
                ],
              },
            },
            {
              kind: "Field",
              name: { kind: "Name", value: "createdBy" },
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
                    name: { kind: "Name", value: "email" },
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
                    name: { kind: "Name", value: "nickname" },
                    arguments: [],
                    directives: [],
                  },
                  {
                    kind: "Field",
                    name: { kind: "Name", value: "picture" },
                    arguments: [],
                    directives: [],
                  },
                  { kind: "Field", name: { kind: "Name", value: "__typename" } },
                ],
              },
            },
            { kind: "Field", name: { kind: "Name", value: "__typename" } },
          ],
        },
      },
      {
        kind: "Field",
        name: { kind: "Name", value: "visibleFocusList" },
        arguments: [
          {
            kind: "Argument",
            name: { kind: "Name", value: "clientKey" },
            value: {
              kind: "Variable",
              name: { kind: "Name", value: "clientKey" },
            },
          },
        ],
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
              name: { kind: "Name", value: "focusKey" },
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
              name: { kind: "Name", value: "visibility" },
              arguments: [],
              directives: [],
            },
            {
              kind: "Field",
              name: { kind: "Name", value: "boardKeys" },
              arguments: [],
              directives: [],
            },
            {
              kind: "Field",
              name: { kind: "Name", value: "peopleIds" },
              arguments: [],
              directives: [],
            },
            {
              kind: "Field",
              name: { kind: "Name", value: "multiFilters" },
              arguments: [],
              directives: [],
              selectionSet: {
                kind: "SelectionSet",
                selections: [
                  {
                    kind: "Field",
                    name: { kind: "Name", value: "key" },
                    arguments: [],
                    directives: [],
                  },
                  {
                    kind: "Field",
                    name: { kind: "Name", value: "values" },
                    arguments: [],
                    directives: [],
                  },
                  { kind: "Field", name: { kind: "Name", value: "__typename" } },
                ],
              },
            },
            {
              kind: "Field",
              name: { kind: "Name", value: "boolFilters" },
              arguments: [],
              directives: [],
              selectionSet: {
                kind: "SelectionSet",
                selections: [
                  {
                    kind: "Field",
                    name: { kind: "Name", value: "key" },
                    arguments: [],
                    directives: [],
                  },
                  {
                    kind: "Field",
                    name: { kind: "Name", value: "value" },
                    arguments: [],
                    directives: [],
                  },
                  { kind: "Field", name: { kind: "Name", value: "__typename" } },
                ],
              },
            },
            {
              kind: "Field",
              name: { kind: "Name", value: "owner" },
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
                    name: { kind: "Name", value: "email" },
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
                    name: { kind: "Name", value: "nickname" },
                    arguments: [],
                    directives: [],
                  },
                  {
                    kind: "Field",
                    name: { kind: "Name", value: "picture" },
                    arguments: [],
                    directives: [],
                  },
                  { kind: "Field", name: { kind: "Name", value: "__typename" } },
                ],
              },
            },
            {
              kind: "Field",
              name: { kind: "Name", value: "createdBy" },
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
                    name: { kind: "Name", value: "email" },
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
                    name: { kind: "Name", value: "nickname" },
                    arguments: [],
                    directives: [],
                  },
                  {
                    kind: "Field",
                    name: { kind: "Name", value: "picture" },
                    arguments: [],
                    directives: [],
                  },
                  { kind: "Field", name: { kind: "Name", value: "__typename" } },
                ],
              },
            },
            { kind: "Field", name: { kind: "Name", value: "__typename" } },
          ],
        },
      },
    ],
  },
};

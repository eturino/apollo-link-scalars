import { DocumentNode, Kind, OperationDefinitionNode, OperationTypeNode } from "graphql";

export const operationQuery: DocumentNode = {
  kind: Kind.DOCUMENT,
  definitions: [
    {
      kind: Kind.OPERATION_DEFINITION,
      operation: OperationTypeNode.QUERY,
      name: { kind: Kind.NAME, value: "GetClientDashboardFocus" },
      variableDefinitions: [
        {
          kind: Kind.VARIABLE_DEFINITION,
          variable: {
            kind: Kind.VARIABLE,
            name: { kind: Kind.NAME, value: "clientKey" },
          },
          type: {
            kind: Kind.NON_NULL_TYPE,
            type: { kind: Kind.NAMED_TYPE, name: { kind: Kind.NAME, value: "String" } },
          },
          directives: [],
        },
      ],
      directives: [],
      selectionSet: {
        kind: Kind.SELECTION_SET,
        selections: [
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "client" },
            arguments: [
              {
                kind: Kind.ARGUMENT,
                name: { kind: Kind.NAME, value: "clientKey" },
                value: {
                  kind: Kind.VARIABLE,
                  name: { kind: Kind.NAME, value: "clientKey" },
                },
              },
            ],
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
            name: { kind: Kind.NAME, value: "visibleDashboards" },
            arguments: [
              {
                kind: Kind.ARGUMENT,
                name: { kind: Kind.NAME, value: "clientKey" },
                value: {
                  kind: Kind.VARIABLE,
                  name: { kind: Kind.NAME, value: "clientKey" },
                },
              },
            ],
            directives: [],
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: [
                {
                  kind: Kind.FRAGMENT_SPREAD,
                  name: { kind: Kind.NAME, value: "DashboardInfo" },
                  directives: [],
                },
                { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
              ],
            },
          },
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "visibleFocusList" },
            arguments: [
              {
                kind: Kind.ARGUMENT,
                name: { kind: Kind.NAME, value: "clientKey" },
                value: {
                  kind: Kind.VARIABLE,
                  name: { kind: Kind.NAME, value: "clientKey" },
                },
              },
            ],
            directives: [],
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: [
                {
                  kind: Kind.FRAGMENT_SPREAD,
                  name: { kind: Kind.NAME, value: "Focus" },
                  directives: [],
                },
                { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
              ],
            },
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
    {
      kind: Kind.FRAGMENT_DEFINITION,
      name: { kind: Kind.NAME, value: "DashboardInfo" },
      typeCondition: {
        kind: Kind.NAMED_TYPE,
        name: { kind: Kind.NAME, value: "Dashboard" },
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
            name: { kind: Kind.NAME, value: "dashboardKey" },
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
            name: { kind: Kind.NAME, value: "visibility" },
            arguments: [],
            directives: [],
          },
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "description" },
            arguments: [],
            directives: [],
          },
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "owner" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: [
                {
                  kind: Kind.FRAGMENT_SPREAD,
                  name: { kind: Kind.NAME, value: "UserProfile" },
                  directives: [],
                },
                { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
              ],
            },
          },
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "createdBy" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: [
                {
                  kind: Kind.FRAGMENT_SPREAD,
                  name: { kind: Kind.NAME, value: "UserProfile" },
                  directives: [],
                },
                { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
              ],
            },
          },
          { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
        ],
      },
    },
    {
      kind: Kind.FRAGMENT_DEFINITION,
      name: { kind: Kind.NAME, value: "UserProfile" },
      typeCondition: {
        kind: Kind.NAMED_TYPE,
        name: { kind: Kind.NAME, value: "UserProfile" },
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
            name: { kind: Kind.NAME, value: "email" },
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
            name: { kind: Kind.NAME, value: "nickname" },
            arguments: [],
            directives: [],
          },
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "picture" },
            arguments: [],
            directives: [],
          },
          { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
        ],
      },
    },
    {
      kind: Kind.FRAGMENT_DEFINITION,
      name: { kind: Kind.NAME, value: "Focus" },
      typeCondition: {
        kind: Kind.NAMED_TYPE,
        name: { kind: Kind.NAME, value: "Focus" },
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
            name: { kind: Kind.NAME, value: "focusKey" },
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
            name: { kind: Kind.NAME, value: "visibility" },
            arguments: [],
            directives: [],
          },
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "boardKeys" },
            arguments: [],
            directives: [],
          },
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "peopleIds" },
            arguments: [],
            directives: [],
          },
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "multiFilters" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: [
                {
                  kind: Kind.FRAGMENT_SPREAD,
                  name: { kind: Kind.NAME, value: "MultiFilter" },
                  directives: [],
                },
                { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
              ],
            },
          },
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "boolFilters" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: [
                {
                  kind: Kind.FRAGMENT_SPREAD,
                  name: { kind: Kind.NAME, value: "BoolFilter" },
                  directives: [],
                },
                { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
              ],
            },
          },
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "owner" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: [
                {
                  kind: Kind.FRAGMENT_SPREAD,
                  name: { kind: Kind.NAME, value: "UserProfile" },
                  directives: [],
                },
                { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
              ],
            },
          },
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "createdBy" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: [
                {
                  kind: Kind.FRAGMENT_SPREAD,
                  name: { kind: Kind.NAME, value: "UserProfile" },
                  directives: [],
                },
                { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
              ],
            },
          },
          { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
        ],
      },
    },
    {
      kind: Kind.FRAGMENT_DEFINITION,
      name: { kind: Kind.NAME, value: "MultiFilter" },
      typeCondition: {
        kind: Kind.NAMED_TYPE,
        name: { kind: Kind.NAME, value: "MultiFilter" },
      },
      directives: [],
      selectionSet: {
        kind: Kind.SELECTION_SET,
        selections: [
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "key" },
            arguments: [],
            directives: [],
          },
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "values" },
            arguments: [],
            directives: [],
          },
          { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
        ],
      },
    },
    {
      kind: Kind.FRAGMENT_DEFINITION,
      name: { kind: Kind.NAME, value: "BoolFilter" },
      typeCondition: {
        kind: Kind.NAMED_TYPE,
        name: { kind: Kind.NAME, value: "BoolFilter" },
      },
      directives: [],
      selectionSet: {
        kind: Kind.SELECTION_SET,
        selections: [
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "key" },
            arguments: [],
            directives: [],
          },
          {
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: "value" },
            arguments: [],
            directives: [],
          },
          { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
        ],
      },
    },
  ],
  // loc: { start: 0, end: 1171 }
};

// 1. resolve fragments
export const expectedFragmentsReduced: OperationDefinitionNode = {
  kind: Kind.OPERATION_DEFINITION,
  operation: OperationTypeNode.QUERY,
  name: { kind: Kind.NAME, value: "GetClientDashboardFocus" },
  variableDefinitions: [
    {
      kind: Kind.VARIABLE_DEFINITION,
      variable: {
        kind: Kind.VARIABLE,
        name: { kind: Kind.NAME, value: "clientKey" },
      },
      type: {
        kind: Kind.NON_NULL_TYPE,
        type: { kind: Kind.NAMED_TYPE, name: { kind: Kind.NAME, value: "String" } },
      },
      directives: [],
    },
  ],
  directives: [],
  selectionSet: {
    kind: Kind.SELECTION_SET,
    selections: [
      {
        kind: Kind.FIELD,
        name: { kind: Kind.NAME, value: "client" },
        arguments: [
          {
            kind: Kind.ARGUMENT,
            name: { kind: Kind.NAME, value: "clientKey" },
            value: {
              kind: Kind.VARIABLE,
              name: { kind: Kind.NAME, value: "clientKey" },
            },
          },
        ],
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
        name: { kind: Kind.NAME, value: "visibleDashboards" },
        arguments: [
          {
            kind: Kind.ARGUMENT,
            name: { kind: Kind.NAME, value: "clientKey" },
            value: {
              kind: Kind.VARIABLE,
              name: { kind: Kind.NAME, value: "clientKey" },
            },
          },
        ],
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
              name: { kind: Kind.NAME, value: "dashboardKey" },
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
              name: { kind: Kind.NAME, value: "visibility" },
              arguments: [],
              directives: [],
            },
            {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: "description" },
              arguments: [],
              directives: [],
            },
            {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: "owner" },
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
                    name: { kind: Kind.NAME, value: "email" },
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
                    name: { kind: Kind.NAME, value: "nickname" },
                    arguments: [],
                    directives: [],
                  },
                  {
                    kind: Kind.FIELD,
                    name: { kind: Kind.NAME, value: "picture" },
                    arguments: [],
                    directives: [],
                  },
                  { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
                ],
              },
            },
            {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: "createdBy" },
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
                    name: { kind: Kind.NAME, value: "email" },
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
                    name: { kind: Kind.NAME, value: "nickname" },
                    arguments: [],
                    directives: [],
                  },
                  {
                    kind: Kind.FIELD,
                    name: { kind: Kind.NAME, value: "picture" },
                    arguments: [],
                    directives: [],
                  },
                  { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
                ],
              },
            },
            { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
          ],
        },
      },
      {
        kind: Kind.FIELD,
        name: { kind: Kind.NAME, value: "visibleFocusList" },
        arguments: [
          {
            kind: Kind.ARGUMENT,
            name: { kind: Kind.NAME, value: "clientKey" },
            value: {
              kind: Kind.VARIABLE,
              name: { kind: Kind.NAME, value: "clientKey" },
            },
          },
        ],
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
              name: { kind: Kind.NAME, value: "focusKey" },
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
              name: { kind: Kind.NAME, value: "visibility" },
              arguments: [],
              directives: [],
            },
            {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: "boardKeys" },
              arguments: [],
              directives: [],
            },
            {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: "peopleIds" },
              arguments: [],
              directives: [],
            },
            {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: "multiFilters" },
              arguments: [],
              directives: [],
              selectionSet: {
                kind: Kind.SELECTION_SET,
                selections: [
                  {
                    kind: Kind.FIELD,
                    name: { kind: Kind.NAME, value: "key" },
                    arguments: [],
                    directives: [],
                  },
                  {
                    kind: Kind.FIELD,
                    name: { kind: Kind.NAME, value: "values" },
                    arguments: [],
                    directives: [],
                  },
                  { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
                ],
              },
            },
            {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: "boolFilters" },
              arguments: [],
              directives: [],
              selectionSet: {
                kind: Kind.SELECTION_SET,
                selections: [
                  {
                    kind: Kind.FIELD,
                    name: { kind: Kind.NAME, value: "key" },
                    arguments: [],
                    directives: [],
                  },
                  {
                    kind: Kind.FIELD,
                    name: { kind: Kind.NAME, value: "value" },
                    arguments: [],
                    directives: [],
                  },
                  { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
                ],
              },
            },
            {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: "owner" },
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
                    name: { kind: Kind.NAME, value: "email" },
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
                    name: { kind: Kind.NAME, value: "nickname" },
                    arguments: [],
                    directives: [],
                  },
                  {
                    kind: Kind.FIELD,
                    name: { kind: Kind.NAME, value: "picture" },
                    arguments: [],
                    directives: [],
                  },
                  { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
                ],
              },
            },
            {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: "createdBy" },
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
                    name: { kind: Kind.NAME, value: "email" },
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
                    name: { kind: Kind.NAME, value: "nickname" },
                    arguments: [],
                    directives: [],
                  },
                  {
                    kind: Kind.FIELD,
                    name: { kind: Kind.NAME, value: "picture" },
                    arguments: [],
                    directives: [],
                  },
                  { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
                ],
              },
            },
            { kind: Kind.FIELD, name: { kind: Kind.NAME, value: "__typename" } },
          ],
        },
      },
    ],
  },
};

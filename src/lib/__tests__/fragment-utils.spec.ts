import { FragmentDefinitionNode } from "graphql";
import { Dictionary } from "lodash";
import { fragmentMapFrom } from "../fragment-utils";
import { ReducedFieldNode } from "../node-types";

export const fragments: FragmentDefinitionNode[] = [
  {
    kind: "FragmentDefinition",
    name: { kind: "Name", value: "Client" },
    typeCondition: {
      kind: "NamedType",
      name: { kind: "Name", value: "Client" }
    },
    directives: [],
    selectionSet: {
      kind: "SelectionSet",
      selections: [
        {
          kind: "Field",
          name: { kind: "Name", value: "id" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "clientKey" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "name" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "status" },
          arguments: [],
          directives: []
        },
        { kind: "Field", name: { kind: "Name", value: "__typename" } }
      ]
    }
  },
  {
    kind: "FragmentDefinition",
    name: { kind: "Name", value: "DashboardInfo" },
    typeCondition: {
      kind: "NamedType",
      name: { kind: "Name", value: "Dashboard" }
    },
    directives: [],
    selectionSet: {
      kind: "SelectionSet",
      selections: [
        {
          kind: "Field",
          name: { kind: "Name", value: "id" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "clientKey" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "dashboardKey" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "name" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "visibility" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "description" },
          arguments: [],
          directives: []
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
                directives: []
              },
              { kind: "Field", name: { kind: "Name", value: "__typename" } }
            ]
          }
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
                directives: []
              },
              { kind: "Field", name: { kind: "Name", value: "__typename" } }
            ]
          }
        },
        { kind: "Field", name: { kind: "Name", value: "__typename" } }
      ]
    }
  },
  {
    kind: "FragmentDefinition",
    name: { kind: "Name", value: "UserProfile" },
    typeCondition: {
      kind: "NamedType",
      name: { kind: "Name", value: "UserProfile" }
    },
    directives: [],
    selectionSet: {
      kind: "SelectionSet",
      selections: [
        {
          kind: "Field",
          name: { kind: "Name", value: "id" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "email" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "name" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "nickname" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "picture" },
          arguments: [],
          directives: []
        },
        { kind: "Field", name: { kind: "Name", value: "__typename" } }
      ]
    }
  },
  {
    kind: "FragmentDefinition",
    name: { kind: "Name", value: "Focus" },
    typeCondition: {
      kind: "NamedType",
      name: { kind: "Name", value: "Focus" }
    },
    directives: [],
    selectionSet: {
      kind: "SelectionSet",
      selections: [
        {
          kind: "Field",
          name: { kind: "Name", value: "id" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "clientKey" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "focusKey" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "name" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "visibility" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "boardKeys" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "peopleIds" },
          arguments: [],
          directives: []
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
                directives: []
              },
              { kind: "Field", name: { kind: "Name", value: "__typename" } }
            ]
          }
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
                directives: []
              },
              { kind: "Field", name: { kind: "Name", value: "__typename" } }
            ]
          }
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
                directives: []
              },
              { kind: "Field", name: { kind: "Name", value: "__typename" } }
            ]
          }
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
                directives: []
              },
              { kind: "Field", name: { kind: "Name", value: "__typename" } }
            ]
          }
        },
        { kind: "Field", name: { kind: "Name", value: "__typename" } }
      ]
    }
  },
  {
    kind: "FragmentDefinition",
    name: { kind: "Name", value: "MultiFilter" },
    typeCondition: {
      kind: "NamedType",
      name: { kind: "Name", value: "MultiFilter" }
    },
    directives: [],
    selectionSet: {
      kind: "SelectionSet",
      selections: [
        {
          kind: "Field",
          name: { kind: "Name", value: "key" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "values" },
          arguments: [],
          directives: []
        },
        { kind: "Field", name: { kind: "Name", value: "__typename" } }
      ]
    }
  },
  {
    kind: "FragmentDefinition",
    name: { kind: "Name", value: "BoolFilter" },
    typeCondition: {
      kind: "NamedType",
      name: { kind: "Name", value: "BoolFilter" }
    },
    directives: [],
    selectionSet: {
      kind: "SelectionSet",
      selections: [
        {
          kind: "Field",
          name: { kind: "Name", value: "key" },
          arguments: [],
          directives: []
        },
        {
          kind: "Field",
          name: { kind: "Name", value: "value" },
          arguments: [],
          directives: []
        },
        { kind: "Field", name: { kind: "Name", value: "__typename" } }
      ]
    }
  }
];

export const flatten: Dictionary<ReducedFieldNode[]> = {
  Client: [
    {
      kind: "Field",
      name: { kind: "Name", value: "id" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "clientKey" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "name" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "status" },
      arguments: [],
      directives: []
    },
    { kind: "Field", name: { kind: "Name", value: "__typename" } }
  ],
  DashboardInfo: [
    {
      kind: "Field",
      name: { kind: "Name", value: "id" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "clientKey" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "dashboardKey" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "name" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "visibility" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "description" },
      arguments: [],
      directives: []
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
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "email" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "name" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "nickname" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "picture" },
            arguments: [],
            directives: []
          },
          { kind: "Field", name: { kind: "Name", value: "__typename" } }
        ]
      }
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
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "email" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "name" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "nickname" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "picture" },
            arguments: [],
            directives: []
          },
          { kind: "Field", name: { kind: "Name", value: "__typename" } }
        ]
      }
    },
    { kind: "Field", name: { kind: "Name", value: "__typename" } }
  ],
  UserProfile: [
    {
      kind: "Field",
      name: { kind: "Name", value: "id" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "email" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "name" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "nickname" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "picture" },
      arguments: [],
      directives: []
    },
    { kind: "Field", name: { kind: "Name", value: "__typename" } }
  ],
  Focus: [
    {
      kind: "Field",
      name: { kind: "Name", value: "id" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "clientKey" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "focusKey" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "name" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "visibility" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "boardKeys" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "peopleIds" },
      arguments: [],
      directives: []
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
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "values" },
            arguments: [],
            directives: []
          },
          { kind: "Field", name: { kind: "Name", value: "__typename" } }
        ]
      }
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
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "value" },
            arguments: [],
            directives: []
          },
          { kind: "Field", name: { kind: "Name", value: "__typename" } }
        ]
      }
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
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "email" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "name" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "nickname" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "picture" },
            arguments: [],
            directives: []
          },
          { kind: "Field", name: { kind: "Name", value: "__typename" } }
        ]
      }
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
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "email" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "name" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "nickname" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "picture" },
            arguments: [],
            directives: []
          },
          { kind: "Field", name: { kind: "Name", value: "__typename" } }
        ]
      }
    },
    { kind: "Field", name: { kind: "Name", value: "__typename" } }
  ],
  MultiFilter: [
    {
      kind: "Field",
      name: { kind: "Name", value: "key" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "values" },
      arguments: [],
      directives: []
    },
    { kind: "Field", name: { kind: "Name", value: "__typename" } }
  ],
  BoolFilter: [
    {
      kind: "Field",
      name: { kind: "Name", value: "key" },
      arguments: [],
      directives: []
    },
    {
      kind: "Field",
      name: { kind: "Name", value: "value" },
      arguments: [],
      directives: []
    },
    { kind: "Field", name: { kind: "Name", value: "__typename" } }
  ]
};

describe("fragmentMapFrom(fragmentList: FragmentDefinitionNode[]): Dictionary<ReducedFieldNode[]>", () => {
  it("returns an object with each Fragment name as key, and as value the list of all FieldNodes, replacing all fragment spreads for the actual Field nodes, deeply", () => {
    expect(fragmentMapFrom(fragments)).toEqual(flatten);
  });
});

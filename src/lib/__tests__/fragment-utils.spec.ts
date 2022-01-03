import { FragmentDefinitionNode, Kind } from "graphql";
import { Dictionary } from "../../types/dictionary";
import { fragmentMapFrom } from "../fragment-utils";
import { ReducedFieldNode } from "../node-types";

export const fragments: FragmentDefinitionNode[] = [
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
];

export const flatten: Dictionary<ReducedFieldNode[]> = {
  Client: [
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
  DashboardInfo: [
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
  UserProfile: [
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
  Focus: [
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
  MultiFilter: [
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
  BoolFilter: [
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
};

describe("fragmentMapFrom(fragmentList: FragmentDefinitionNode[]): Dictionary<ReducedFieldNode[]>", () => {
  it("returns an object with each Fragment name as key, and as value the list of all FieldNodes, replacing all fragment spreads for the actual Field nodes, deeply", () => {
    expect(fragmentMapFrom(fragments)).toEqual(flatten);
  });
});

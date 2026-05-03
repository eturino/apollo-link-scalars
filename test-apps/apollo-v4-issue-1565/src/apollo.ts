import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { withScalars } from "apollo-link-scalars";
import {
  buildClientSchema,
  GraphQLID,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLString,
  introspectionFromSchema,
  type IntrospectionQuery,
} from "graphql";

// Mirror the user's repro shape: build a small schema, introspect it, then
// rebuild with `buildClientSchema`. Round-tripping through introspection is
// what the user's setup does (`buildClientSchema(introspectionResult)`), so
// keep the same code path here.
const DateScalar = new GraphQLScalarType({ name: "Date" });

const FilmType = new GraphQLObjectType({
  name: "Film",
  fields: {
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    releaseDate: { type: DateScalar },
  },
});

const RootType = new GraphQLObjectType({
  name: "Root",
  fields: {
    film: {
      type: FilmType,
      args: { filmID: { type: GraphQLID } },
    },
  },
});

const introspection: IntrospectionQuery = introspectionFromSchema(new GraphQLSchema({ query: RootType }));
const schema = buildClientSchema(introspection);

const typesMap = {
  Date: {
    serialize: (value: unknown) => (value instanceof Date ? value.toISOString() : null),
    parseValue: (raw: unknown): Date | null => {
      if (raw instanceof Date) return raw;
      return typeof raw === "string" ? new Date(raw) : null;
    },
  },
};

const httpLink = new HttpLink({ uri: "/graphql" });

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([withScalars({ schema, typesMap }), httpLink]),
});

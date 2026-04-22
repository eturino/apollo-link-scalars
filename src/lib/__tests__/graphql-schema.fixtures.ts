import { buildClientSchema } from "graphql";
import introspectionSchemaResult from "./introspection.json";

// @ts-expect-error - shape of the bundled introspection JSON doesn't line up
// with graphql's stricter IntrospectionQuery type at compile time, but it's a
// valid introspection payload at runtime.
export const graphqlSchemaObj = buildClientSchema(introspectionSchemaResult);

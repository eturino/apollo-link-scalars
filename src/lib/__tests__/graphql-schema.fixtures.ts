import { buildClientSchema } from "graphql";

import introspectionSchemaResult from "./introspection.json";

// @ts-ignore
export const graphqlSchemaObj = buildClientSchema(introspectionSchemaResult);

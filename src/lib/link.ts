import { ApolloLink, Observable } from "apollo-link";
import { GraphQLSchema, isLeafType } from "graphql";
import { pickBy } from "lodash";
import { ZenObservable } from "zen-observable-ts";
import { FunctionsMap } from "..";
import { treatResult } from "./treat-result";

export const withScalars = (
  schema: GraphQLSchema,
  typesMap: FunctionsMap = {}
): ApolloLink => {
  const leafTypesMap = pickBy(schema.getTypeMap(), isLeafType);
  const functionsMap: FunctionsMap = { ...leafTypesMap, ...typesMap };

  // ApolloLink code based on https://github.com/with-heart/apollo-link-response-resolver
  return new ApolloLink((operation, forward) => {
    return new Observable(observer => {
      const opts = { schema, typesMap, functionsMap };
      if (!opts) throw new Error();
      let sub: ZenObservable.Subscription;

      try {
        sub = forward(operation).subscribe({
          next: result => {
            observer.next(treatResult(schema, functionsMap, operation, result));
          },
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer)
        });
      } catch (e) {
        observer.error(e);
      }

      return () => {
        if (sub) sub.unsubscribe();
      };
    });
  });
};

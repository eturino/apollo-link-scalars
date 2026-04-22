import {
  ApolloClient,
  ApolloLink,
  execute as apolloExecute,
  FetchResult,
  GraphQLRequest,
  InMemoryCache,
  Observable,
} from "@apollo/client/core";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const apolloPkgVersion: string = require("@apollo/client/package.json").version;
const isV4 = apolloPkgVersion.startsWith("4.");

const testClient = new ApolloClient({ cache: new InMemoryCache(), link: ApolloLink.empty() });

// v4's `execute` requires a third `{ client }` context arg; v3's signature is 2-arg.
// Normalise both behind the same call shape so specs don't branch on version.
export function execute(link: ApolloLink, request: GraphQLRequest): Observable<FetchResult> {
  if (isV4) {
    return (
      apolloExecute as unknown as (l: ApolloLink, r: GraphQLRequest, c: { client: unknown }) => Observable<FetchResult>
    )(link, request, { client: testClient });
  }
  return (apolloExecute as unknown as (l: ApolloLink, r: GraphQLRequest) => Observable<FetchResult>)(link, request);
}

// v3 ships `Observable.of` (zen-observable); v4 swapped to rxjs which has no such static.
// Use the static when available, fall back to the constructor pattern (works on both).
export function observableOf<T>(value: T): Observable<T> {
  const Obs = Observable as unknown as { of?: <U>(v: U) => Observable<U> };
  if (typeof Obs.of === "function") {
    return Obs.of(value);
  }
  return new Observable<T>((sub) => {
    sub.next(value);
    sub.complete();
  });
}

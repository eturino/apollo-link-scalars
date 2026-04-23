import {
  ApolloClient,
  ApolloLink,
  execute as apolloExecute,
  type FetchResult,
  type GraphQLRequest,
  InMemoryCache,
  Observable,
} from "@apollo/client/core";

const apolloPkgVersion: string = require("@apollo/client/package.json").version;
const isV4 = apolloPkgVersion.startsWith("4.");

const testClient = new ApolloClient({ cache: new InMemoryCache(), link: ApolloLink.empty() });

// v4's `execute` requires a third `{ client }` context arg; v3's signature is 2-arg.
// Normalise both behind the same call shape so specs don't branch on version.
// The signature differs between majors, so we route through `any` to satisfy
// whichever one happens to be installed.
const executeAny = apolloExecute as unknown as (
  l: ApolloLink,
  r: GraphQLRequest,
  c?: { client: unknown }
) => Observable<FetchResult>;

export function execute(link: ApolloLink, request: GraphQLRequest): Observable<FetchResult> {
  return isV4 ? executeAny(link, request, { client: testClient }) : executeAny(link, request);
}

// Promise helper: subscribe once, resolve on the first `next`, reject on error.
// Used by specs to convert the old jest `done`-callback pattern into async/await.
export function firstValue<T>(observable: Observable<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    observable.subscribe({ next: resolve, error: reject });
  });
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

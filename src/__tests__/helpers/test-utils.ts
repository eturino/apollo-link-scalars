import { ApolloClient, ApolloLink, execute as apolloExecute, InMemoryCache, Observable } from "@apollo/client";

const testClient = new ApolloClient({ cache: new InMemoryCache(), link: ApolloLink.empty() });

export function execute(link: ApolloLink, request: ApolloLink.Request): Observable<ApolloLink.Result> {
  return apolloExecute(link, request, { client: testClient });
}

export function observableOf<T>(value: T): Observable<T> {
  return new Observable<T>((sub) => {
    sub.next(value);
    sub.complete();
  });
}

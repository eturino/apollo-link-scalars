import { gql, Observable, type Operation } from "@apollo/client/core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { ScalarApolloLink } from "../link";

function makeOperation(
  query = gql`
    query LinkSpec {
      _empty
    }
  `
): Operation {
  return {
    query,
    variables: {},
    extensions: {},
    operationName: "LinkSpec",
    setContext: () => ({}),
    getContext: () => ({}),
  } as unknown as Operation;
}

describe("ScalarApolloLink.request", () => {
  const schema = makeExecutableSchema({
    typeDefs: gql`
      type Query {
        _empty: Boolean
      }
    `,
  });

  it("completes when no forward function is provided", async () => {
    const link = new ScalarApolloLink({ schema });

    await expect(
      new Promise<void>((resolve, reject) => {
        link.request(makeOperation()).subscribe({
          next: () => {
            reject(new Error("unexpected next"));
          },
          error: reject,
          complete: resolve,
        });
      })
    ).resolves.toBeUndefined();
  });

  it("completes when forward returns null", async () => {
    const link = new ScalarApolloLink({ schema });

    await expect(
      new Promise<void>((resolve, reject) => {
        link
          .request(makeOperation(), () => null)
          .subscribe({
            next: () => {
              reject(new Error("unexpected next"));
            },
            error: reject,
            complete: resolve,
          });
      })
    ).resolves.toBeUndefined();
  });

  it("forwards synchronous errors to the observer", async () => {
    const link = new ScalarApolloLink({ schema });
    const expected = new Error("boom");

    await expect(
      new Promise<void>((resolve, reject) => {
        link
          .request(makeOperation(), () => {
            throw expected;
          })
          .subscribe({
            next: () => {
              reject(new Error("unexpected next"));
            },
            error: (error) => {
              expect(error).toBe(expected);
              resolve();
            },
            complete: () => {
              reject(new Error("unexpected complete"));
            },
          });
      })
    ).resolves.toBeUndefined();
  });

  it("unsubscribes the forwarded observable on teardown", () => {
    const link = new ScalarApolloLink({ schema });
    const unsubscribe = vi.fn();

    const subscription = link
      .request(makeOperation(), () => {
        return new Observable(() => ({ unsubscribe }));
      })
      .subscribe({});

    subscription.unsubscribe();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});

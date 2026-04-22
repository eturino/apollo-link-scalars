import { Subscription as ZenSubscription } from "zen-observable-ts";

// The structural shape we use internally for `sub` in `link.ts`. Kept in sync
// with the definition there - if it narrows, this file must narrow too.
interface LinkSubscription {
  unsubscribe(): void;
}

describe("type compatibility with Observable subscription shapes", () => {
  it("zen-observable Subscription (v3 Apollo Observable) assigns to LinkSubscription", () => {
    // Compile-time check. The runtime body is a formality; `yarn type-check`
    // and the `build:*` scripts are where the real assertion happens.
    const assignZen = (s: ZenSubscription): LinkSubscription => s;
    expect(assignZen).toBeInstanceOf(Function);
  });

  it("ad-hoc {unsubscribe} (v4 rxjs Subscription shape) assigns to LinkSubscription", () => {
    // rxjs isn't a direct dependency, so we model its Subscription structurally.
    // This matches `import('rxjs').Subscription` minus the bells and whistles.
    interface RxLikeSubscription {
      unsubscribe(): void;
      closed: boolean;
    }
    const assignRx = (s: RxLikeSubscription): LinkSubscription => s;
    expect(assignRx).toBeInstanceOf(Function);
  });
});

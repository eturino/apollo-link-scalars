import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { client, getNetworkHits, resetNetworkHits } from "./apollo";

const GET_ITEMS = gql`
  query GetItems($amount: BigInt) {
    items(amount: $amount) {
      id
      label
      amount
    }
  }
`;

const RECORD_ITEM = gql`
  mutation RecordItem($amount: BigInt!) {
    recordItem(amount: $amount) {
      id
      label
      amount
    }
  }
`;

interface ItemRow {
  id: string;
  label: string;
  amount: bigint;
}

const FIRST_AMOUNT = 12345678901234567890n;
const SECOND_AMOUNT = 99999999999999999999n;

export function App() {
  const [networkHits, setNetworkHits] = useState(() => getNetworkHits());
  const [currentAmount, setCurrentAmount] = useState<bigint | null>(null);
  const [mutationResult, setMutationResult] = useState<string>("");
  const [mutationError, setMutationError] = useState<string>("");

  const { data, loading, error } = useQuery<{ items: ItemRow[] }>(GET_ITEMS, {
    variables: { amount: currentAmount },
    fetchPolicy: "cache-first",
    skip: currentAmount === null,
  });

  const [recordItem] = useMutation<{ recordItem: ItemRow }>(RECORD_ITEM);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNetworkHits(getNetworkHits());
    }, 50);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const status = currentAmount === null
    ? "idle"
    : loading
      ? "loading"
      : error
        ? `error:${error.message}`
        : "loaded";
  const label = data?.items[0]?.label ?? "";
  const isBigInt = typeof data?.items[0]?.amount === "bigint";

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>apollo-link-scalars · BigInt repro</h1>
      <p>
        Cache-first query and mutation with a custom-serialized <code>BigInt</code> variable.
        Toggling A → B → A should yield exactly 2 network hits when{" "}
        <code>ensureSerializableVariables</code> is enabled. Without the flag, Apollo&apos;s
        <code>canonicalStringify</code> throws on the BigInt before the link runs.
      </p>
      <p data-testid="status">{status}</p>
      <p data-testid="label">{label || "empty"}</p>
      <p data-testid="is-bigint">{String(isBigInt)}</p>
      <p data-testid="network-hits">{String(networkHits)}</p>
      <p data-testid="mutation-result">{mutationResult || "empty"}</p>
      <p data-testid="mutation-error">{mutationError || "empty"}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          data-testid="reset"
          type="button"
          onClick={() => {
            resetNetworkHits();
            setNetworkHits(getNetworkHits());
            setCurrentAmount(null);
            setMutationResult("");
            setMutationError("");
            void client.clearStore();
          }}
        >
          Reset
        </button>
        <button
          data-testid="load-a"
          type="button"
          onClick={() => {
            setCurrentAmount(FIRST_AMOUNT);
          }}
        >
          Load A
        </button>
        <button
          data-testid="load-b"
          type="button"
          onClick={() => {
            setCurrentAmount(SECOND_AMOUNT);
          }}
        >
          Load B
        </button>
        <button
          data-testid="run-mutation"
          type="button"
          onClick={() => {
            setMutationResult("");
            setMutationError("");
            recordItem({ variables: { amount: FIRST_AMOUNT } })
              .then((res) => {
                const item = res.data?.recordItem;
                setMutationResult(item ? `${item.label}:${typeof item.amount}` : "no-data");
              })
              .catch((e: Error) => {
                setMutationError(e.message);
              });
          }}
        >
          Run mutation
        </button>
      </div>
    </main>
  );
}

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { getNetworkHits, resetNetworkHits } from "./apollo";

const GET_EVENTS = gql`
  query GetEvents($at: DateTime) {
    events(at: $at) {
      id
      label
      at
    }
  }
`;

interface EventRow {
  id: string;
  label: string;
  at: Date;
}

export function App() {
  const [networkHits, setNetworkHits] = useState(() => getNetworkHits());
  const [currentAt, setCurrentAt] = useState<Date | null>(null);

  const { data, loading, error } = useQuery<{ events: EventRow[] }>(GET_EVENTS, {
    variables: { at: currentAt },
    fetchPolicy: "cache-first",
    skip: !currentAt,
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNetworkHits(getNetworkHits());
    }, 50);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const status = !currentAt
    ? "idle"
    : loading
      ? "loading"
      : error
        ? `error:${error.message}`
        : "loaded";
  const label = data?.events[0]?.label ?? "";
  const isDate = data?.events[0]?.at instanceof Date;

  const firstDate = () => new Date("2023-08-19T00:00:00.000Z");
  const secondDate = () => new Date("2023-08-20T00:00:00.000Z");

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>apollo-link-scalars · issue #1041 repro</h1>
      <p>
        Cache-first query with a custom-serialized <code>DateTime</code> variable.
        Toggling A → B → A should yield exactly 2 network hits; before the fix it yielded 3.
      </p>
      <p data-testid="status">{status}</p>
      <p data-testid="label">{label || "empty"}</p>
      <p data-testid="is-date">{String(isDate)}</p>
      <p data-testid="network-hits">{String(networkHits)}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          data-testid="reset"
          type="button"
          onClick={() => {
            resetNetworkHits();
            setNetworkHits(getNetworkHits());
            setCurrentAt(null);
          }}
        >
          Reset
        </button>
        <button
          data-testid="load-a"
          type="button"
          onClick={() => {
            setCurrentAt(firstDate());
          }}
        >
          Load A
        </button>
        <button
          data-testid="load-b"
          type="button"
          onClick={() => {
            setCurrentAt(secondDate());
          }}
        >
          Load B
        </button>
      </div>
    </main>
  );
}

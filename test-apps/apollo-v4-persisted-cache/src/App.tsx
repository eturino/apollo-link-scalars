import { useApolloClient } from "@apollo/client/react";
import { useState } from "react";
import { GET_CHARACTER, networkCounter } from "./apollo";

interface Character {
  id: string;
  name: string;
  created: Date | string;
}

interface CharacterData {
  character: Character;
}

function describe(value: unknown): {
  type: string;
  isDate: boolean;
  iso: string;
} {
  const isDate = value instanceof Date;
  return {
    type: typeof value,
    isDate,
    iso: isDate ? value.toISOString() : String(value),
  };
}

export function App() {
  const client = useApolloClient();
  const [lastSource, setLastSource] = useState<"never" | "network" | "cache">("never");
  const [renderedChar, setRenderedChar] = useState<Character | null>(null);

  // Synchronous peek at whatever the cache currently holds (post-rehydration
  // on reload; empty on first visit). Apollo returns null if the query isn't
  // materialized in cache yet.
  const cachedOnMount = client.cache.readQuery<CharacterData>({
    query: GET_CHARACTER,
    variables: { id: "1" },
  });

  async function handleFetch() {
    const before = networkCounter.count;
    const result = await client.query<CharacterData>({
      query: GET_CHARACTER,
      variables: { id: "1" },
    });
    const usedNetwork = networkCounter.count > before;
    setLastSource(usedNetwork ? "network" : "cache");
    setRenderedChar(result.data?.character ?? null);
  }

  function handleClear() {
    window.localStorage.clear();
    window.location.reload();
  }

  const cachedMeta = cachedOnMount ? describe(cachedOnMount.character.created) : null;
  const renderedMeta = renderedChar ? describe(renderedChar.created) : null;

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24, maxWidth: 720 }}>
      <h1>apollo-link-scalars · persisted cache</h1>
      <p>
        Reproduces <a href="https://github.com/eturino/apollo-link-scalars/issues/760">issue #760</a>:
        custom scalars parsed by the link are re-hydrated from localStorage as plain JSON values,
        bypassing the scalar map.
      </p>

      <section>
        <h2>Cache state on mount</h2>
        {cachedMeta ? (
          <dl>
            <dt>typeof created</dt>
            <dd data-testid="cached-type">{cachedMeta.type}</dd>
            <dt>created instanceof Date</dt>
            <dd data-testid="cached-is-date">{String(cachedMeta.isDate)}</dd>
            <dt>value</dt>
            <dd data-testid="cached-iso">{cachedMeta.iso}</dd>
          </dl>
        ) : (
          <p data-testid="cached-empty">no cached query on mount</p>
        )}
      </section>

      <section>
        <h2>Actions</h2>
        <button data-testid="button-fetch" type="button" onClick={() => void handleFetch()}>
          Run query (cache-first)
        </button>{" "}
        <button data-testid="button-clear" type="button" onClick={handleClear}>
          Clear cache & reload
        </button>
      </section>

      <section>
        <h2>Last render</h2>
        <p>
          source: <span data-testid="last-source">{lastSource}</span>
        </p>
        {renderedMeta ? (
          <dl>
            <dt>typeof created</dt>
            <dd data-testid="rendered-type">{renderedMeta.type}</dd>
            <dt>created instanceof Date</dt>
            <dd data-testid="rendered-is-date">{String(renderedMeta.isDate)}</dd>
            <dt>value</dt>
            <dd data-testid="rendered-iso">{renderedMeta.iso}</dd>
          </dl>
        ) : (
          <p data-testid="rendered-empty">no query run yet</p>
        )}
      </section>

      <section>
        <h2>network request count</h2>
        <p data-testid="network-count">{networkCounter.count}</p>
      </section>
    </main>
  );
}

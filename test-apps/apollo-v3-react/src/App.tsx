import { gql, useQuery } from "@apollo/client";
import { useState } from "react";

const GET_CHARACTER = gql`
  query GetCharacter($id: ID!) {
    character(id: $id) {
      id
      name
      created
    }
  }
`;

interface Character {
  id: string;
  name: string;
  created: Date;
}

function Character({ id }: { id: string }) {
  const { data, loading, error } = useQuery<{ character: Character }>(GET_CHARACTER, {
    variables: { id },
    skip: !id,
  });

  if (!id) return <p data-testid="status">idle</p>;
  if (loading) return <p data-testid="status">loading</p>;
  if (error) return <p data-testid="status">error: {error.message}</p>;
  if (!data?.character) return <p data-testid="status">empty</p>;

  const c = data.character;
  const isDate = c.created instanceof Date;
  return (
    <dl>
      <dt>name</dt>
      <dd data-testid="char-name">{c.name}</dd>
      <dt>created (ISO)</dt>
      <dd data-testid="char-created-iso">{isDate ? c.created.toISOString() : String(c.created)}</dd>
      <dt>created year</dt>
      <dd data-testid="char-created-year">{isDate ? c.created.getFullYear() : "NaN"}</dd>
      <dt>created is Date</dt>
      <dd data-testid="char-created-is-date">{String(isDate)}</dd>
    </dl>
  );
}

export function App() {
  const [input, setInput] = useState("");
  const [id, setId] = useState("");

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>apollo-link-scalars · Apollo v3 · React</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setId(input);
        }}
      >
        <label>
          Character id:{" "}
          <input
            data-testid="input-id"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="1"
          />
        </label>{" "}
        <button data-testid="button-fetch" type="submit">
          Fetch
        </button>
      </form>
      <Character id={id} />
    </main>
  );
}

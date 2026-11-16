import { gql } from "@apollo/client";
import { useMutation, useQuery, useSubscription } from "@apollo/client/react";
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

const CREATE_CHARACTER = gql`
  mutation CreateCharacter($input: CreateCharacterInput!) {
    createCharacter(input: $input) {
      id
      name
      created
    }
  }
`;

const CHARACTER_CREATED = gql`
  subscription CharacterCreated {
    characterCreated {
      id
      name
      created
    }
  }
`;

const CREATED_AT = new Date("2020-01-02T03:04:05.000Z");

function describeCreated(created: unknown): { iso: string; isDate: string } {
  return created instanceof Date
    ? { iso: created.toISOString(), isDate: "true" }
    : { iso: String(created), isDate: "false" };
}

function CreatedFeed() {
  const { data, error } = useSubscription<{ characterCreated: Character }>(CHARACTER_CREATED);
  if (error) return <p data-testid="sub-status">error: {error.message}</p>;
  if (!data) return <p data-testid="sub-status">waiting</p>;
  const { iso, isDate } = describeCreated(data.characterCreated.created);
  return (
    <dl>
      <dt>subscription name</dt>
      <dd data-testid="sub-name">{data.characterCreated.name}</dd>
      <dt>subscription created (ISO)</dt>
      <dd data-testid="sub-created-iso">{iso}</dd>
      <dt>subscription created is Date</dt>
      <dd data-testid="sub-created-is-date">{isDate}</dd>
    </dl>
  );
}

function CreateCharacter() {
  const [create, { data, error }] = useMutation<{ createCharacter: Character }>(CREATE_CHARACTER);
  const result = data ? describeCreated(data.createCharacter.created) : null;
  return (
    <section>
      <button
        data-testid="button-create"
        type="button"
        onClick={() => void create({ variables: { input: { name: "Squanchy", created: CREATED_AT } } })}
      >
        Create Squanchy
      </button>
      {error && <p data-testid="create-status">error: {error.message}</p>}
      {data && result && (
        <dl>
          <dt>mutation name</dt>
          <dd data-testid="create-name">{data.createCharacter.name}</dd>
          <dt>mutation created (ISO)</dt>
          <dd data-testid="create-created-iso">{result.iso}</dd>
          <dt>mutation created is Date</dt>
          <dd data-testid="create-created-is-date">{result.isDate}</dd>
        </dl>
      )}
    </section>
  );
}

export function App() {
  const [input, setInput] = useState("");
  const [id, setId] = useState("");

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>apollo-link-scalars · Apollo v4 · React</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setId(input);
        }}
      >
        <label>
          Character id:{" "}
          <input data-testid="input-id" value={input} onChange={(e) => setInput(e.target.value)} placeholder="1" />
        </label>{" "}
        <button data-testid="button-fetch" type="submit">
          Fetch
        </button>
      </form>
      <Character id={id} />
      <CreateCharacter />
      <CreatedFeed />
    </main>
  );
}

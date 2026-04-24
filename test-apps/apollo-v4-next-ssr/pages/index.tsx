import { ApolloProvider, useQuery } from "@apollo/client/react";
import type { NormalizedCacheObject } from "@apollo/client";
import type { GetServerSideProps } from "next";
import { useState } from "react";
import { createApolloClient, GET_CHARACTER, networkCounter, seedApolloState } from "../lib/apollo";

interface PageProps {
  applyFix: boolean;
  initialApolloState: NormalizedCacheObject;
}

function CharacterView() {
  const { data } = useQuery(GET_CHARACTER, {
    variables: { id: "1" },
    fetchPolicy: "cache-first",
  });

  const created = data?.character.created;

  return (
    <main>
      <h1>apollo-link-scalars · Apollo v4 · Next SSR</h1>
      <div data-testid="fix-flag">{created ? (created instanceof Date ? "on" : "off") : "unknown"}</div>
      <div data-testid="network-count">{String(networkCounter.count)}</div>
      <div data-testid="char-name">{data?.character.name ?? ""}</div>
      <div data-testid="char-created-type">{typeof created}</div>
      <div data-testid="char-created-is-date">{String(created instanceof Date)}</div>
      <div data-testid="char-created-iso">{created instanceof Date ? created.toISOString() : String(created ?? "")}</div>
    </main>
  );
}

export default function HomePage({ applyFix, initialApolloState }: PageProps) {
  const [client] = useState(() => createApolloClient({ initialState: initialApolloState, applyFix }));

  return (
    <ApolloProvider client={client}>
      <CharacterView />
    </ApolloProvider>
  );
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({ query }) => {
  const initialApolloState = JSON.parse(JSON.stringify(await seedApolloState())) as NormalizedCacheObject;
  networkCounter.count = 0;

  return {
    props: {
      applyFix: query.fix === "1",
      initialApolloState,
    },
  };
};

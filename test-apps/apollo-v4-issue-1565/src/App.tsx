import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const DEMO = gql`
  query Demo {
    film(filmID: "1") {
      id
      title
      releaseDate
    }
  }
`;

interface DemoResult {
  film: { id: string; title: string; releaseDate: Date | null } | null;
}

export function App() {
  const { data, loading, error } = useQuery<DemoResult>(DEMO);

  if (loading) return <p data-testid="status">loading</p>;
  if (error) return <p data-testid="status">error: {error.message}</p>;
  if (!data?.film) return <p data-testid="status">empty</p>;

  const isDate = data.film.releaseDate instanceof Date;
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>apollo-link-scalars · issue #1565</h1>
      <p data-testid="status">{isDate ? "parsed" : "not parsed"}</p>
      <dl>
        <dt>title</dt>
        <dd data-testid="title">{data.film.title}</dd>
        <dt>releaseDate is Date</dt>
        <dd data-testid="is-date">{String(isDate)}</dd>
        <dt>releaseDate ISO</dt>
        <dd data-testid="release-iso">
          {isDate ? data.film.releaseDate!.toISOString() : String(data.film.releaseDate)}
        </dd>
      </dl>
    </main>
  );
}

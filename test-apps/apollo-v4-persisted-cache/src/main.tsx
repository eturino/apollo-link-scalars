import { ApolloProvider } from "@apollo/client/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { bootstrap } from "./apollo";

// URL flag picks between the issue #760 reproduction and the
// reviveScalarsInCache fix path. Playwright toggles it via `?fix=1`.
const applyFix = new URLSearchParams(window.location.search).get("fix") === "1";

const client = await bootstrap({ applyFix });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App applyFix={applyFix} />
    </ApolloProvider>
  </React.StrictMode>,
);

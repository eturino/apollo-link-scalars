import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { client } from "./apollo";
import { ApolloProvider } from "@apollo/client";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
);

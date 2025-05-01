
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Set the document title
document.title = "MC STORE | Algerian Online Shopping";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// <reference types="@vitejs/plugin-react/preamble" />
import "@vitejs/plugin-react/preamble";
import ReactDOM from "react-dom/client";
import { App } from "./App";

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<App />);
}

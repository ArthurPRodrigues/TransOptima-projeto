import React from "react";
import { createRoot } from "react-dom/client";
import App from "./Apps";

const el = document.getElementById("root");
if (!el) throw new Error("Elemento #root não encontrado");

createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

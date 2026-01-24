import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Toaster } from "@/components/ui/sonner";
import { SearchProvider } from "@/context/SearchContext.jsx";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SearchProvider>
      <App />
      <Toaster position="top-center"  />
    </SearchProvider>
  </StrictMode>
);

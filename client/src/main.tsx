import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { store } from "./app/store.ts";
import { router } from "./app/router.tsx";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);

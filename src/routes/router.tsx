// src/router.tsx
import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home.tsx";
import Success from "../pages/Success.tsx";
import ErrorPage from "../pages/ErrorPage.tsx";
import RootLayout from "../layout/RootLayout.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "success", element: <Success /> },
    ],
  },
]);

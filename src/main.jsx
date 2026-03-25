
import React from 'react';

import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './core/stores/store';
import './index.css';

import Home from './core/pages/Home.jsx';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>
  },
]);
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);

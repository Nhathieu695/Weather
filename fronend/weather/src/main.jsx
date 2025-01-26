import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from './App.jsx';
import SearchPage from './pages/search.jsx';
import ResultsTable from './pages/results.jsx';
import WeatherPage from './pages/weather.jsx';
import LoginPage from './pages/login.jsx';
import RegisterPage from './pages/register.jsx';
import { UserProvider } from "../usercontext.jsx"
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <SearchPage />,
      },
      {
        path: "/result",
        element: <ResultsTable />,
      },
      {
        path: "/weather",
        element: <WeatherPage />,
      },
      {
        path: "/login", // Route cho trang đăng nhập
        element: <LoginPage />,
      },
      {
        path: "/register", // Route cho trang đăng ký
        element: <RegisterPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </React.StrictMode>
);

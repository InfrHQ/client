import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Landing from './pages/landing';
import Recorder from './pages/dashboard/recorder';
import Player from './pages/dashboard/replay';
import Preference from './pages/dashboard/preference';
import { initSentry } from './lib/telemetry';

import './index.css';
const router = createBrowserRouter([
    {
        path: '/dashboard',
        element: <Dashboard />,
    },
    {
        path: '/dashboard/recorder',
        element: <Recorder />,
    },
    {
        path: '/dashboard/player',
        element: <Player />,
    },
    {
        path: '/dashboard/preference',
        element: <Preference />,
    },
    {
        path: '/',
        element: <Landing />,
    },
]);

initSentry();

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);

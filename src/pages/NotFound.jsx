/**
 * NotFound.jsx
 * 
 * @description React Page Component: NotFound.
 * @usage Rendered by react-router-dom as a full-page view.
 * @details Often contains state management, useEffect hooks for fetching initial data, and renders multiple smaller components.
 */

import { useLocation } from "react-router-dom";
import { useEffect } from "react";
const NotFound = () => {
    const location = useLocation();
    useEffect(() => {
        console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }, [location.pathname]);
    return (<div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>);
};
export default NotFound;

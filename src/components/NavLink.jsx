/**
 * NavLink.jsx
 * 
 * @description Feature-specific React Component.
 * @usage Used within pages to break down complex UI into smaller, manageable chunks.
 * @details Might contain some local state relevant to the component but often relies on props passed down from the parent page.
 */

import { NavLink as RouterNavLink } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
const NavLink = forwardRef(({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (<RouterNavLink ref={ref} to={to} className={({ isActive, isPending }) => cn(className, isActive && activeClassName, isPending && pendingClassName)} {...props}/>);
});
NavLink.displayName = "NavLink";
export { NavLink };

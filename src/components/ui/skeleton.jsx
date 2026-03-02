/**
 * skeleton.jsx
 * 
 * @description Generic Reusable UI Component (often Shadcn UI).
 * @usage Import and use throughout the frontend as low-level building blocks (Buttons, Inputs, Dialogs).
 * @details Styling usually utilizes Tailwind CSS. Avoid putting business logic here.
 */

import { cn } from "@/lib/utils";
function Skeleton({ className, ...props }) {
    return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props}/>;
}
export { Skeleton };

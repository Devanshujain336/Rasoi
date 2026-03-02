/**
 * toggle.jsx
 * 
 * @description Generic Reusable UI Component (often Shadcn UI).
 * @usage Import and use throughout the frontend as low-level building blocks (Buttons, Inputs, Dialogs).
 * @details Styling usually utilizes Tailwind CSS. Avoid putting business logic here.
 */

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const toggleVariants = cva("inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground", {
    variants: {
        variant: {
            default: "bg-transparent",
            outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        },
        size: {
            default: "h-10 px-3",
            sm: "h-9 px-2.5",
            lg: "h-11 px-5",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
const Toggle = React.forwardRef(({ className, variant, size, ...props }, ref) => (<TogglePrimitive.Root ref={ref} className={cn(toggleVariants({ variant, size, className }))} {...props}/>));
Toggle.displayName = TogglePrimitive.Root.displayName;
export { Toggle, toggleVariants };

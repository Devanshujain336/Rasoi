/**
 * separator.jsx
 * 
 * @description Generic Reusable UI Component (often Shadcn UI).
 * @usage Import and use throughout the frontend as low-level building blocks (Buttons, Inputs, Dialogs).
 * @details Styling usually utilizes Tailwind CSS. Avoid putting business logic here.
 */

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";
const Separator = React.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (<SeparatorPrimitive.Root ref={ref} decorative={decorative} orientation={orientation} className={cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className)} {...props}/>));
Separator.displayName = SeparatorPrimitive.Root.displayName;
export { Separator };

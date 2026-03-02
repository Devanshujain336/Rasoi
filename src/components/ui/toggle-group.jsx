/**
 * toggle-group.jsx
 * 
 * @description Generic Reusable UI Component (often Shadcn UI).
 * @usage Import and use throughout the frontend as low-level building blocks (Buttons, Inputs, Dialogs).
 * @details Styling usually utilizes Tailwind CSS. Avoid putting business logic here.
 */

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";
const ToggleGroupContext = React.createContext({
    size: "default",
    variant: "default",
});
const ToggleGroup = React.forwardRef(({ className, variant, size, children, ...props }, ref) => (<ToggleGroupPrimitive.Root ref={ref} className={cn("flex items-center justify-center gap-1", className)} {...props}>
    <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>));
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;
const ToggleGroupItem = React.forwardRef(({ className, children, variant, size, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext);
    return (<ToggleGroupPrimitive.Item ref={ref} className={cn(toggleVariants({
            variant: context.variant || variant,
            size: context.size || size,
        }), className)} {...props}>
      {children}
    </ToggleGroupPrimitive.Item>);
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;
export { ToggleGroup, ToggleGroupItem };

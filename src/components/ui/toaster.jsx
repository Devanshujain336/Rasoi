/**
 * toaster.jsx
 * 
 * @description Generic Reusable UI Component (often Shadcn UI).
 * @usage Import and use throughout the frontend as low-level building blocks (Buttons, Inputs, Dialogs).
 * @details Styling usually utilizes Tailwind CSS. Avoid putting business logic here.
 */

import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
export function Toaster() {
    const { toasts } = useToast();
    return (<ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
            return (<Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>);
        })}
      <ToastViewport />
    </ToastProvider>);
}

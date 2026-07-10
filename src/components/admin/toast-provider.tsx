"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";
type Toast = { id: string; type: ToastType; message: string };

const ToastContext = React.createContext<{ show: (type: ToastType, message: string) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const show = React.useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const dismiss = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-2.5 rounded-sm border bg-white px-4 py-3 text-sm shadow-glass-lg dark:bg-conservatory-900",
              t.type === "success" && "border-green-200 dark:border-green-900",
              t.type === "error" && "border-red-200 dark:border-red-900",
              t.type === "info" && "border-stone-200 dark:border-stone-700"
            )}
          >
            {t.type === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />}
            {t.type === "error" && <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />}
            {t.type === "info" && <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-bronze-400" />}
            <p className="flex-1 text-stone-700 dark:text-stone-200">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="flex-shrink-0 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast() must be used within <ToastProvider>.");
  return ctx.show;
}

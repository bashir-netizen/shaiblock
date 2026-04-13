"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle, Info, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// Toast system — for bid events, outbid alerts, etc.
// ============================================================

type ToastType = "info" | "success" | "warning" | "danger" | "outbid";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  body?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { ...toast, id, duration: toast.duration || 4000 };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, newToast.duration);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-[calc(100vw-2rem)] sm:w-96">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const config = {
    info: {
      icon: Info,
      bg: "bg-card border-primary/30",
      iconColor: "text-primary",
    },
    success: {
      icon: CheckCircle,
      bg: "bg-card border-success/30",
      iconColor: "text-success",
    },
    warning: {
      icon: AlertCircle,
      bg: "bg-card border-accent/30",
      iconColor: "text-accent",
    },
    danger: {
      icon: AlertCircle,
      bg: "bg-card border-danger/30",
      iconColor: "text-danger",
    },
    outbid: {
      icon: Zap,
      bg: "bg-danger text-white border-danger",
      iconColor: "text-white",
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "pointer-events-auto rounded-xl border-2 shadow-2xl px-4 py-3 flex items-start gap-3 transition-all duration-300",
        config.bg,
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        toast.type === "outbid" && "animate-pulse-danger"
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", config.iconColor)} />
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "font-bold text-sm",
            toast.type === "outbid" ? "text-white" : "text-foreground"
          )}
        >
          {toast.title}
        </div>
        {toast.body && (
          <div
            className={cn(
              "text-xs mt-0.5",
              toast.type === "outbid" ? "text-white/90" : "text-muted"
            )}
          >
            {toast.body}
          </div>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className={cn(
          "flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity",
          toast.type === "outbid" ? "text-white" : "text-muted"
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

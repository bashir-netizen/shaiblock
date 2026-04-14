"use client";

import {
  createContext,
  useContext,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// ============================================================
// Tabs — neutral tab primitive
// Composition: <Tabs>, <TabList>, <TabTrigger value="">, <TabPanel value="">
// Copper underline indicator on active trigger.
// ============================================================

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
}
const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  onValueChange?: (v: string) => void;
}

export function Tabs({
  defaultValue,
  onValueChange,
  className,
  children,
  ...rest
}: TabsProps) {
  const [value, setValueState] = useState(defaultValue);
  const setValue = (v: string) => {
    setValueState(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("flex flex-col", className)} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1 border-b border-border",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface TabTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  children: ReactNode;
}

export function TabTrigger({ value, className, children, ...rest }: TabTriggerProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabTrigger must be used within Tabs");
  const active = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => ctx.setValue(value)}
      className={cn(
        "px-4 py-2 text-sm font-medium transition-colors relative",
        active
          ? "text-primary"
          : "text-[var(--color-ink-muted)] hover:text-foreground",
        className
      )}
      {...rest}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
      )}
    </button>
  );
}

interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

export function TabPanel({ value, className, children, ...rest }: TabPanelProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabPanel must be used within Tabs");
  if (ctx.value !== value) return null;
  return (
    <div role="tabpanel" className={cn("pt-4", className)} {...rest}>
      {children}
    </div>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// Accordion — neutral accordion primitive
// Supports 'single' or 'multiple' open sections.
// Composition: <Accordion type="single">, <AccordionItem value="">,
//              <AccordionTrigger>, <AccordionContent>
// ============================================================

interface AccordionContextValue {
  type: "single" | "multiple";
  openSet: Set<string>;
  toggle: (v: string) => void;
}
const AccordionContext = createContext<AccordionContextValue | null>(null);

const AccordionItemContext = createContext<string | null>(null);

interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  type: "single" | "multiple";
  defaultValue?: string | string[];
}

export function Accordion({
  type,
  defaultValue,
  className,
  children,
  ...rest
}: AccordionProps) {
  const initial = new Set<string>(
    Array.isArray(defaultValue)
      ? defaultValue
      : defaultValue
        ? [defaultValue]
        : []
  );
  const [openSet, setOpenSet] = useState<Set<string>>(initial);

  const toggle = useCallback(
    (v: string) => {
      setOpenSet((prev) => {
        const next = new Set(prev);
        if (next.has(v)) {
          next.delete(v);
        } else {
          if (type === "single") next.clear();
          next.add(v);
        }
        return next;
      });
    },
    [type]
  );

  return (
    <AccordionContext.Provider value={{ type, openSet, toggle }}>
      <div className={cn("divide-y divide-border", className)} {...rest}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function AccordionItem({
  value,
  className,
  children,
  ...rest
}: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={value}>
      <div className={cn("py-3", className)} {...rest}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function AccordionTrigger({
  className,
  children,
  ...rest
}: AccordionTriggerProps) {
  const ctx = useContext(AccordionContext);
  const value = useContext(AccordionItemContext);
  if (!ctx || !value)
    throw new Error("AccordionTrigger must be used within AccordionItem");
  const open = ctx.openSet.has(value);
  return (
    <button
      type="button"
      onClick={() => ctx.toggle(value)}
      aria-expanded={open}
      className={cn(
        "flex w-full items-center justify-between text-left font-medium text-foreground hover:text-primary transition-colors",
        className
      )}
      {...rest}
    >
      {children}
      <ChevronDown
        className={cn("w-4 h-4 transition-transform", open && "rotate-180")}
      />
    </button>
  );
}

interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function AccordionContent({
  className,
  children,
  ...rest
}: AccordionContentProps) {
  const ctx = useContext(AccordionContext);
  const value = useContext(AccordionItemContext);
  if (!ctx || !value)
    throw new Error("AccordionContent must be used within AccordionItem");
  if (!ctx.openSet.has(value)) return null;
  return (
    <div
      className={cn("pt-3 text-[var(--color-ink-muted)] text-sm", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

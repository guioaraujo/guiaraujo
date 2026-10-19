"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "accent";

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-6 text-[17px] font-semibold transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100",
        variant === "primary" && "bg-ink text-cream",
        variant === "secondary" && "border border-ink/15 bg-white text-ink",
        variant === "ghost" && "bg-transparent text-ink",
        variant === "accent" && "bg-accent text-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-ink shadow-sm backdrop-blur transition active:scale-95",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function BackButton({ href, className }: { href?: string; className?: string }) {
  const router = useRouter();
  return (
    <IconButton
      aria-label="Voltar"
      className={className}
      onClick={() => (href ? router.push(href) : router.back())}
    >
      <ChevronLeft size={22} />
    </IconButton>
  );
}

export function Chip({
  children,
  tone = "sand",
  className,
}: {
  children: ReactNode;
  tone?: "sand" | "accent" | "leaf" | "ink";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium leading-none",
        tone === "sand" && "bg-sand text-ink-soft",
        tone === "accent" && "bg-accent-soft text-accent",
        tone === "leaf" && "bg-leaf-soft text-leaf",
        tone === "ink" && "bg-ink text-cream",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-3xl border border-ink/5 bg-white p-4 shadow-[0_1px_2px_rgba(28,25,23,0.04)]", className)}>
      {children}
    </div>
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-sand-dark", className)}>
      <div
        className="h-full rounded-full bg-ink transition-[width] duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/** Rodapé fixo com área segura do iPhone. */
export function BottomBar({
  children,
  className,
  aboveTabs = false,
}: {
  children: ReactNode;
  className?: string;
  /** Em telas com a barra de abas, sobe a barra para ficar acima dela. */
  aboveTabs?: boolean;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 z-30 mx-auto w-full max-w-md bg-gradient-to-t from-cream via-cream/95 to-transparent px-5 pt-6",
        className,
      )}
      style={
        aboveTabs
          ? { bottom: "calc(var(--safe-bottom) + 58px)", paddingBottom: 12 }
          : { bottom: 0, paddingBottom: "calc(var(--safe-bottom) + 16px)" }
      }
    >
      <div className="pointer-events-auto">{children}</div>
    </div>
  );
}

export function Title({ children, className }: { children: ReactNode; className?: string }) {
  return <h1 className={cn("font-serif text-[28px] leading-[1.15] text-ink", className)}>{children}</h1>;
}

export function Subtitle({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("mt-2 text-[15px] leading-snug text-muted", className)}>{children}</p>;
}

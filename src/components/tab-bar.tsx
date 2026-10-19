"use client";

import { cn } from "@/lib/utils";
import { BookOpen, CalendarDays, ShoppingBasket, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/plano", label: "Plano", icon: CalendarDays },
  { href: "/lista", label: "Lista", icon: ShoppingBasket },
  { href: "/receitas", label: "Receitas", icon: BookOpen },
  { href: "/perfil", label: "Perfil", icon: UserRound },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-ink/8 bg-cream/90 backdrop-blur-xl"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <ul className="flex h-[58px] items-stretch">
        {TABS.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + "/");
          const Icon = t.icon;
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition",
                  active ? "text-ink" : "text-muted",
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

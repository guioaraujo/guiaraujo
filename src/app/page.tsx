"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const hydrated = useStore((s) => s.hydrated);
  const hasProfile = useStore((s) => !!s.profile);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(hasProfile ? "/plano" : "/onboarding");
  }, [hydrated, hasProfile, router]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-accent text-[40px] shadow-lg">🍽️</div>
      <h1 className="font-serif text-[34px]">Despensa</h1>
      <p className="text-[15px] text-muted">Seu plano de refeições dentro do orçamento.</p>
    </main>
  );
}

"use client";

import { TabBar } from "@/components/tab-bar";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useStore((s) => s.hydrated);
  const hasProfile = useStore((s) => !!s.profile);

  useEffect(() => {
    if (hydrated && !hasProfile) router.replace("/onboarding");
  }, [hydrated, hasProfile, router]);

  return (
    <>
      <div className="min-h-dvh" style={{ paddingBottom: "calc(var(--safe-bottom) + 72px)" }}>
        {hydrated && hasProfile ? children : null}
      </div>
      <TabBar />
    </>
  );
}

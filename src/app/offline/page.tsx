import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <div className="text-[56px]">📴</div>
      <h1 className="mt-4 font-serif text-[26px]">Você está offline</h1>
      <p className="mt-2 text-muted">Seu plano e sua lista continuam salvos no aparelho. Tente de novo quando a conexão voltar.</p>
      <Link href="/plano" className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-cream">
        Abrir o plano
      </Link>
    </main>
  );
}

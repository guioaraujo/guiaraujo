import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { Pwa } from "@/components/pwa";
import "./globals.css";

export const metadata: Metadata = {
  title: "Despensa",
  description: "Plano de refeições da semana dentro do seu orçamento, com lista de compras por corredor.",
  applicationName: "Despensa",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Despensa",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Pwa>
          <div className="mx-auto min-h-dvh w-full max-w-md bg-cream">{children}</div>
        </Pwa>
        <Toaster position="top-center" richColors closeButton={false} toastOptions={{ className: "font-sans" }} />
      </body>
    </html>
  );
}

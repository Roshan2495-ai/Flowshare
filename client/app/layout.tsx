import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import InstallButton from "./components/InstallButton";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FlowShare - Instant File Sharing",
  description: "Share files instantly across devices with QR codes. Fast, secure, and simple.",
  keywords: ["file sharing", "QR code", "instant transfer", "FlowShare"],
  authors: [{ name: "FlowShare" }],
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b5cf6" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Capture beforeinstallprompt as early as possible — before React mounts */}
        <script dangerouslySetInnerHTML={{
          __html: `
          window.__pwaPrompt = null;
          window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            window.__pwaPrompt = e;
            window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
          });
        `}} />
        <InstallButton />
        {children}
      </body>
    </html>
  );
}

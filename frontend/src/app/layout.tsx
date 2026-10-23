import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "PitchPulse Studio | Premier League Real-Time Match Intelligence",
  description:
    "Containerized broadcast telemetry intelligence engine powered by Azure Container Apps, Azure OpenAI Service, deterministic spatial mathematics, and verifiable multi-agent receipts.",
  keywords: [
    "PitchPulse",
    "Premier League",
    "Football Analytics",
    "Expected Threat",
    "Azure OpenAI",
    "Azure Container Apps",
    "Multi-Agent AI",
  ],
  authors: [{ name: "PitchPulse Architecture Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-cyan-500 selection:text-slate-950`}>
        {children}
      </body>
    </html>
  );
}

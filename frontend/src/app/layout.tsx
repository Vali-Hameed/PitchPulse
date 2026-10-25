import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
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
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} bg-[#07080A] text-[#F4F4F6] antialiased min-h-screen selection:bg-[#E5C158]/30 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}

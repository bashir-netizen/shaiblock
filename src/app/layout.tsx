import type { Metadata } from "next";
import { Inter, Fraunces, Amiri, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers";
import { ToastProvider } from "@/components/toast-system";
import { TopNav } from "@/components/top-nav";
import { BottomNav } from "@/components/bottom-nav";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShaiBlock — Sudan's Live Tea Auction",
  description:
    "Sudan's first live tea auction. Retailers from Khartoum, Omdurman, and Port Sudan bid on verified tea lots from Kenya, India, Sri Lanka, and beyond. Transparent pricing. Verified quality. Instant settlement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${amiri.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground font-sans min-h-screen">
        <AuthProvider>
          <ToastProvider>
            <TopNav />
            <main className="pb-16 md:pb-0">{children}</main>
            <BottomNav />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

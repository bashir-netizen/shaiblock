import type { Metadata } from "next";
import { Inter, Playfair_Display, Noto_Sans_Arabic } from "next/font/google";
import { AuthProvider } from "@/components/providers";
import { ToastProvider } from "@/components/toast-system";
import { TopNav } from "@/components/top-nav";
import { BottomNav } from "@/components/bottom-nav";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
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
      className={`${inter.variable} ${playfair.variable} ${notoArabic.variable} h-full antialiased`}
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

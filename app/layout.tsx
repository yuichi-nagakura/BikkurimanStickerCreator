import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

const inter = Inter({ subsets: ["latin"] });
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "ビックリマンメーカー",
  description: "AIでビックリマンシール風の画像を生成",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body
        className={`${inter.className} ${notoSansJP.variable} min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900`}
      >
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

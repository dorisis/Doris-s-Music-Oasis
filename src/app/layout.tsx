import type { Metadata } from "next";
import { Cinzel, Noto_Serif_SC, Playfair_Display } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-cinzel",
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["300", "500"],
  variable: "--font-noto-serif-sc",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["italic"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Doris's Music Oasis | 音乐记忆流",
  description:
    "记录各个时期的耳朵偏好、演唱会票根，以及 KTV 深夜里被唱响的旋律。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${cinzel.variable} ${notoSerifSC.variable} ${playfairDisplay.variable}`}
    >
      <body className="min-h-screen text-purple-950 selection:bg-purple-200">
        {children}
        <style>{`
          [data-nextjs-dev-tools],
          [data-inspector],
          [class*="nextjs-inspector"],
          [class*="dev-tools"],
          .nextjs-inspector,
          #__nextjs-inspector {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `}</style>
      </body>
    </html>
  );
}

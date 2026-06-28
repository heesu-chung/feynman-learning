import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Feynman Learning OS",
  description: "A personal understanding system based on the Feynman technique.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

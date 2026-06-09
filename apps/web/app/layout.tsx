import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NAVYK — Career OS для молодых талантов",
  description: "Найди карьерный путь и дойди до первой стажировки с NAVYK",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

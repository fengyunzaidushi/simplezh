import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "simplezh · 中文转换工作台",
  description: "保留格式的简繁中文转换工具",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

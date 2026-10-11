import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Quest Garden — A little progress, every day",
  description:
    "Small steps today, a brighter you tomorrow. Grow your daily progress with Quest Garden.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

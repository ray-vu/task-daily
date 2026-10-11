import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Vườn nhiệm vụ — Tiến bộ mỗi ngày",
  description:
    "Bước nhỏ hôm nay, tương lai tươi sáng hơn. Vun trồng tiến bộ mỗi ngày cùng Vườn nhiệm vụ.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}

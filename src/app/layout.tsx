import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MJVC Attendance",
  description: "Control de asistencia privado",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
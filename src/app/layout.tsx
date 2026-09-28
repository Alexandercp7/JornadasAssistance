import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MJVC Attendance",
  description: "Control de asistencia privado",
  icons: {
    icon: "/vector.png",
    shortcut: "/vector.png",
    apple: "/vector.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/vector.png" sizes="any" />
        <link rel="apple-touch-icon" href="/vector.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&family=Manrope:wght@200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
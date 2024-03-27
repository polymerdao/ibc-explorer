import type { Metadata } from "next";
import { primary, mono, accent } from 'fonts'
import Navbar from "./components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "IBC Explorer",
  description: "Polymer Labs IBC Explorer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={'dark ' + `${primary.variable} ${mono.variable} ${accent.variable}`}>
      <body>
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}

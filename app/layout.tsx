import type { Metadata } from "next";
import { Rubik, Noto_Sans_Mono } from 'next/font/google'
import Navbar from "./components/navbar";
import "./globals.css";

const primary = Rubik({
  subsets: ['latin'],
  variable: '--primary-font',
  display: 'swap',
})
 
const mono = Noto_Sans_Mono({
  subsets: ['latin'],
  variable: '--mono-font',
  display: 'swap',
})

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
    <html lang="en" className={'dark ' + `${primary.variable} ${mono.variable}`}>
      <body>
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}

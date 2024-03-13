import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "./components/navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main>
          <div className="relative flex place-items-center justify-end overflow-none z-[-1] blur-[2.2rem] before:content-[''] before:absolute before:h-[6rem] before:w-[60rem] before:bg-white before:dark:bg-slate-900 before:rounded-[50%] origin-left rotate-[23deg] top-auto right-auto md:top-[-6rem] md:right-[-4rem] lg:top-[-6rem] lg:right-[-5rem] xl:top-[-8rem] xl:right-[-6rem] 2xl:top-[-8rem] 2xl:right-[-14rem]">
          </div>
          {children}
        </main>
      </body>
    </html>
  );
}

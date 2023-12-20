import './globals.css';

import { Suspense } from 'react';
import Navbar from "./navbar";
import { Providers } from "./providers";

export const metadata = {
  title: 'IBC Explorer',
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full">
        <Suspense>
          <Navbar/>
        </Suspense>
        <Providers>
        {children}
        </Providers>
      </body>
    </html>
  );
}

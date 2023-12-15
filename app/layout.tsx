import './globals.css';

import { Suspense } from 'react';
import Navbar from "./navbar";

export const metadata = {
  title: 'Polymer Dashboard',
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
        {children}
      </body>
    </html>
  );
}

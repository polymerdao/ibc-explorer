import type { Metadata } from 'next';
import { primary, mono } from 'fonts'
import Navbar from './components/navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Polymer Explorer',
  description: 'Polymer Labs IBC Explorer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={'dark ' + `${primary.variable} ${mono.variable}`}>
      <body className="animate-black-to-vapor">
        <video
          autoPlay muted loop
          className="fixed z-[-10] border-l-[1px] border-black object-cover w-full h-full opacity-[93%] transform"
          src="/Polymer_Background-Loop_Final_Black.mp4">
        </video>
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}

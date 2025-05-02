import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "../components/layout/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prisam Engitech - Airflow Management System",
  description: "Manage your airflow quotations and services efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col pt-16 md:pt-24 relative bg-slate-50 text-slate-800`}
      >
        <Navigation />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6">
            <div className="rounded-xl bg-white/80 backdrop-blur-md shadow-lg border border-white/40 p-6 md:p-8">
              {children}
            </div>
          </div>
        </main>
        <footer className="bg-slate-800 text-white py-4 mt-8">
          <div className="container mx-auto px-4 text-center">
            <p>© {new Date().getFullYear()} Prisam Engitech - All Rights Reserved</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

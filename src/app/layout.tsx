import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XFnite",
  description: "Xfnite",
};

import { MaintenanceUI } from "@/components/MaintenanceUI";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isMaintenance = process.env.UNDER_MAINTENANCE === "true" || process.env.NEXT_PUBLIC_UNDER_MAINTENANCE === "true";
  const estimatedTime = process.env.MAINTENANCE_END_TIME || process.env.NEXT_PUBLIC_MAINTENANCE_END_TIME;

  if (isMaintenance) {
    return (
      <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased font-sans`}>
        <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#060D14] text-[#E0E1DD] transition-colors duration-200">
          <MaintenanceUI estimatedTime={estimatedTime} />
        </body>
      </html>
    );
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}

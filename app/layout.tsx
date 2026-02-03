import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BillProvider } from "@/context/bill-context";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Splitbillz - Split Bills Easily",
  description: "No-auth bill splitting app for dining with friends",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <BillProvider>
          {children}
          <Toaster />
        </BillProvider>
      </body>
    </html>
  );
}

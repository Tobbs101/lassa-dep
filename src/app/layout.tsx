import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI4Lassa - Early Detection & Response System",
  description: "AI-powered application for early detection, monitoring, and response to Lassa Fever outbreaks in Nigeria",
  keywords: ["Lassa Fever", "AI", "Healthcare", "Nigeria", "Early Detection", "Public Health"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
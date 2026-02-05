import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import ConvexClientProvider from "@/components/providers";

import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "New Polaris Project",
  description: "Ai code editor",
};

/**
 * Root layout component that sets up global providers, fonts, theme, and header, then renders page content.
 *
 * @param children - The page content to render inside the layout
 * @returns The top-level layout element configured with authentication, theme, and typography, containing a header with sign-in/sign-up controls and the provided `children`
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plexMono.variable} antialiased`}>
        <ConvexClientProvider>
          {children}
          <Toaster />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Manrope, Oswald } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { Nav } from "@/components/Nav";
import { themeInitScript } from "@/components/theme-init";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Pickonomics",
  description: "Pick winners in NFL, MLB, ACC, SEC, and Big Ten leagues",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${oswald.variable} antialiased`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <div className="site-shell">
          <div className="wrap">
            <Nav user={user} />
            {children}
          </div>
        </div>
        <Analytics />
      </body>
    </html>
  );
}

import "./globals.css";
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils" 
import { Libre_Baskerville } from "next/font/google"
import config from "@/config"
import { ThemeProvider } from "@/components/themeprovider"
import localFont from "next/font/local";
import { CSPostHogProvider } from './providers'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const DepartureMono = localFont({
  src: './fonts/DepartureMono-Regular.woff',
  variable: '--font-departure-mono',
});

const baskerville = Libre_Baskerville({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
  display: "swap",
});

export const metadata = {
  title: config.siteName,
  name: config.siteName,
  description: config.siteDescription,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("antialiased", inter.variable, baskerville.variable, DepartureMono.variable)}>
      <CSPostHogProvider>
      <body
        className={cn(
          "min-h-screen bg-background antialiased"
        )}
        style={{
          fontFamily: 'var(--font-sans)'
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme-preference"
        > 
          {children}
        </ThemeProvider>
      </body>
      </CSPostHogProvider>
    </html>
  );
}
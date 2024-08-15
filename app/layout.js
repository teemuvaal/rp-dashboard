import "./globals.css";
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils" 
import { Libre_Baskerville } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const baskerville = Libre_Baskerville({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
});

export const metadata = {
  title: "Adventurehub.ai",
  description: "Plan, manage and run your adventures with help from AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={cn(inter.variable, baskerville.variable)}>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased"
        )}
      >
        {children}
      </body>
    </html>
  );
}
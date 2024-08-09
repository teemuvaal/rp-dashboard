import "./globals.css";
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"  

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Adventurehub.ai",
  description: "Plan, manage and run your adventures with help from AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
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
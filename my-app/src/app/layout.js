
import "./globals.css";
import Header from "./components/header";
import { SessionProvider } from "next-auth/react";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
      <SessionProvider>
      <Header />
        <main className="pt-16 md:pt-20">
          {/* Padding-top: 64px (pt-16) on mobile, 80px (pt-20) on desktop */}
          {children}
        </main>
        </SessionProvider>
      </body>
    </html>
  );
}

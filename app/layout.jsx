import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";
import GameApp from "./components/GameApp";
import { measurementId } from "./lib/analytics";

export const metadata = {
  title: "The Rainbow Academy — Games for Kindergarteners",
  description:
    "A collection of educational games for young learners.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GameApp />
        {children}
        <Analytics />
        {/* Google Analytics' script, when it's set up (see app/lib/analytics.js for what's sent). */}
        {measurementId && <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />}
      </body>
    </html>
  );
}

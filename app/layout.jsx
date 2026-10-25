import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import GameApp from "./components/GameApp";

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
      </body>
    </html>
  );
}

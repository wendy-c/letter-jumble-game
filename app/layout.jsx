import "./globals.css";
import GameApp from "./components/GameApp";

export const metadata = {
  title: "Learn with Ada and Elly — Games for Kindergarteners",
  description:
    "A collection of educational games for young learners.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GameApp />
        {children}
      </body>
    </html>
  );
}

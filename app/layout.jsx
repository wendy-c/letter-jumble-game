import "./globals.css";

export const metadata = {
  title: "Word Wave — Movers spelling practice",
  description:
    "A picture-based spelling game to help young learners practise Cambridge Movers vocabulary.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Varnam — Festive & Celebratory Couture (Women, Teens & Girls)",
    template: "%s | Varnam",
  },
  description:
    "Handcrafted royal anarkalis, festive co-ord sets, and pure cotton twirl frocks for Women (XS–XXL), Teens (13–18Y), and Girls (2–12Y). Tailored with 100% breathable cotton inner linings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-text-body font-sans">
        {children}
      </body>
    </html>
  );
}

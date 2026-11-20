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
    default: "Varnam — Girls' Couture & Festive Apparel (Ages 2–14Y)",
    template: "%s | Varnam",
  },
  description:
    "Handcrafted zari lehengas, whimsical tiered party gowns, and pure cotton twirl frocks for girls aged 2–14. Tailored with 100% breathable cotton inner linings.",
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

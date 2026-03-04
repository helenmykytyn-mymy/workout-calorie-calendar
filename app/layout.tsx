import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workout + Calories Calendar",
  description: "Local-only monthly workout + calories planner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

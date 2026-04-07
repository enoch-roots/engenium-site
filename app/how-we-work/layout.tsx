import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How We Work",
  description:
    "Discovery first. Systems, not services. We build infrastructure you own — fast, connected, and designed to compound.",
  openGraph: {
    title: "How We Work | Engenium Labs",
    description:
      "Discovery first. Systems, not services. We build infrastructure you own.",
  },
};

export default function ShowcaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

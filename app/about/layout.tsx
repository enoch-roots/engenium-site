import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Where ingenuity meets the generative engine. Engenium Labs builds full-stack digital infrastructure for businesses ready to be found — by customers, search engines, and AI.",
  openGraph: {
    title: "About | Engenium Labs",
    description:
      "Where ingenuity meets the generative engine. Full-stack digital systems, GEO-native, Austin-based.",
  },
};

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

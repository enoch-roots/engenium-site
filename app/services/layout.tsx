import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What We Build",
  description:
    "Strategy, systems, and digital infrastructure engineered to compound. Websites, SEO, AI visibility, CRM, and automation — all connected.",
  openGraph: {
    title: "What We Build | Engenium Labs",
    description:
      "Strategy, systems, and digital infrastructure engineered to compound. Websites, SEO, AI visibility, CRM, and automation — all connected.",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

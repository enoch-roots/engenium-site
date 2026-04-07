import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Who We Work With",
  description:
    "We build for businesses ready to be found — from solo operators to multi-location enterprises. Home services, health & wellness, professional services, and more.",
  openGraph: {
    title: "Who We Work With | Engenium Labs",
    description:
      "We build for businesses ready to be found — from solo operators to multi-location enterprises.",
  },
};

export default function WhoWeWorkWithLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

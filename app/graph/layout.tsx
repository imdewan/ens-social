import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Social Graph",
};

export default function GraphLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

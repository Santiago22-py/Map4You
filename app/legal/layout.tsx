import { PublicHeader } from "@/components/public-header";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      {children}
    </>
  );
}

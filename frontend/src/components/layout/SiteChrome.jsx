"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const NO_CHROME_PREFIXES = ["/payment"];

export default function SiteChrome({ children }) {
  const pathname = usePathname() || "";
  const hideChrome = NO_CHROME_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

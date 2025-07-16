
import { Urbanist } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import { Toaster } from "react-hot-toast";
import ClientProvider from "@/components/ClientProvider/ClientProvider";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "MyScholarHack",
  description:
    " MyScholarHack uses your real stories, achievements, and writing  voice to help you create authentic scholarship essays that win. No made-up  experiences. No generic AI fluff. Just your unique story, told powerfully",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body className={`${urbanist.className} antialiased`}>
        <ClientProvider>
          <SiteChrome>{children}</SiteChrome>
        </ClientProvider>

        <Toaster />
      </body>
    </html>
  );
}

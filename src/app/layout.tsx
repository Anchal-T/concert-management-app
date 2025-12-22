import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "ConcertHub | Management",
  description: "Manage your concerts, artists and venues with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-background text-foreground overflow-x-hidden">
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        
        <div className="flex min-h-screen bg-[#04070D]">
          <Sidebar />
          <div className="flex-1 pl-64">
            <TopBar />
            <main className="pt-20 pb-12 px-8 min-h-screen bg-[#04070D]">
              {children}
            </main>
          </div>
        </div>

        <Toaster />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'mapbox-gl/dist/mapbox-gl.css';
import { LocationProvider } from './contexts/LocationContext';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import { PopoverDemo } from "@/components/SuperAvatar";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Map Biji",
  description: "Interactive map application using Mapbox GL JS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <AuthProvider>
          <LocationProvider>
            <main className="relative h-full">
              {children}
              <div className="fixed bottom-4 left-4 z-50">
                <PopoverDemo />
              </div>
            </main>
            <Toaster />
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


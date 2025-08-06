'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import Footer from "./footer";
import { useTheme } from "next-themes";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      {/* WARNA LATAR BELAKANG UTAMA DARI BODY */}
      <div className="flex min-h-screen bg-gray-100 text-gray-900 dark:bg-[#1e1e2d] dark:text-white">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} />

        {/* Overlay untuk mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Konten Utama */}
        <div className="flex flex-col flex-1 pl-64">
          <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

          <main className="flex-1 p-6">
            {children}
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}

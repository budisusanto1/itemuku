'use client';

import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div className="text-center mt-10">Silakan login terlebih dahulu.</div>;
  }

  return (
  <div className="max-w-7xl mx-auto w-full">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Selamat datang, {session?.user?.name}
  </h1>
</div>

  );
}

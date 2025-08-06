'use client';

import AuthSidebar from './authsidebar'; // atau sesuaikan path
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="flex items-center justify-center px-6 py-12 order-2 lg:order-1">
        <div className="w-full max-w-md rounded-xl shadow-lg border p-10 bg-white">
          {children}
        </div>
      </div>

      <div className="branded-bg hidden lg:flex items-center justify-center order-1 lg:order-2">
        <AuthSidebar />
      </div>
    </div>
  );
}

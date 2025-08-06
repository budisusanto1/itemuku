'use client';

export default function AuthSidebar() {
  return (
    <div
      className="order-1 lg:order-2 relative flex flex-col w-full h-full bg-cover bg-no-repeat bg-top"
      style={{
        backgroundImage: "url('/dashboard-preview.png')", // Gambar full background tajam
      }}
    >
      {/* Konten depan */}
      <div className="relative z-10 flex flex-col p-8 lg:p-16 gap-6">
        {/* Logo */}
        <a href="/metronic/tailwind/nextjs/demo1">
          <img
            className="h-[28px] max-w-none"
            alt="Logo"
            src="https://keenthemes.com/metronic/tailwind/nextjs/demo1/media/app/mini-logo.svg"
          />
        </a>

        {/* Judul & Deskripsi */}
        <div className="flex flex-col gap-3">
          <h3 className="text-2xl font-semibold text-mono">Secure Dashboard Access</h3>
          <div className="text-base font-medium text-secondary-foreground">
            A robust authentication gateway ensuring <br />
            secure <span className="text-mono font-semibold">efficient user access</span> to the Metronic <br />
            Dashboard interface.
          </div>
        </div>
      </div>
    </div>
  );
}

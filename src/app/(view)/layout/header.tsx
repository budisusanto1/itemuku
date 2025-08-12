"use client";

import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

export default function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { theme, setTheme } = useTheme();
  const { data: session, update } = useSession();
  const [mounted, setMounted] = useState(false);

  const [language, setLanguage] = useState<"EN" | "ID">("EN");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-refresh session setiap 5 menit supaya data user (role) selalu update
  useEffect(() => {
    const interval = setInterval(() => {
      update();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [update]);

  const languages = [
    { code: "EN", label: "English", flag: "/amerika.png" },
    { code: "ID", label: "Indonesia", flag: "/indonesia.png" },
  ];
  const currentLang = languages.find((lang) => lang.code === language);

  if (!mounted) return null;

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/signin" });
  };

  // Pastikan roleId selalu string agar mapping warna & label sesuai
  const user = session?.user ?? {
    id: "",
    name: "Guest User",
    email: "guest@example.com",
    image: "/avatars/default.png",
    avatar: "/avatars/default.png",
    roleId: "",
    roleName: "No Role",
    status: "inactive",
  };

  const roleIdStr = user.roleId ? String(user.roleId) : "";

  const roleColors: Record<string, string> = {
    "0": "bg-red-500 text-white", // Superadmin
    "2": "bg-green-500 text-white", // Customer
  };

  const roleLabels: Record<string, string> = {
    "0": "Superadmin",
    "2": "Customer",
  };

  const badgeColor = roleColors[roleIdStr] ?? "bg-gray-300 text-black";
  const roleLabel = roleLabels[roleIdStr] ?? (user.roleName ?? "No Role");

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow transition-colors duration-300">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* KIRI: Logo & Tombol Sidebar Mobile */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 text-gray-700 dark:text-gray-200" onClick={onToggleSidebar}>
            <i className="fas fa-bars text-xl"></i>
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/favicon.png" alt="Logo" width={32} height={32} />
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Metronic</span>
          </Link>
        </div>

        {/* KANAN: Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">
          {/* Theme Switcher */}
          <ThemeButton icon="fa-sun" label="Light" active={theme === "light"} onClick={() => setTheme("light")} />
          <ThemeButton icon="fa-moon" label="Dark" active={theme === "dark"} onClick={() => setTheme("dark")} />

          {/* Language Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-1.5 border rounded border-gray-300 dark:border-gray-600"
            >
              <Image src={currentLang?.flag || "/amerika.png"} alt={language} width={20} height={20} />
              <span>{language}</span>
              <i className={`fa fa-chevron-down text-xs transition-transform ${isLangOpen ? "rotate-180" : ""}`}></i>
            </button>
            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow rounded overflow-hidden z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as "EN" | "ID");
                      setIsLangOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Image src={lang.flag} alt={lang.label} width={20} height={20} />
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 cursor-pointer">
              <Image src={user.image || "/avatars/default.png"} alt="Avatar" width={36} height={36} className="rounded-full" />
              <span className="text-gray-900 dark:text-gray-100 font-medium">{user.name}</span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50 p-3">
                {/* Header Info */}
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <Image src={user.image || "/avatars/default.png"} alt="Avatar" width={48} height={48} className="rounded-full" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${badgeColor}`}>
                      {roleLabel} ({roleIdStr || "?"})
                    </span>
                  </div>
                </div>

                {/* Menu List */}
                <div className="mt-2 text-sm">
                  <MenuItem icon="fa-user" label="Public Profile" />
                  <MenuItem icon="fa-id-card" label="My Profile" />
                  <MenuItem icon="fa-cog" label="My Account" hasArrow />
                  <MenuItem icon="fa-comments" label="Dev Forum" />

                  {/* Language inline */}
                  <div className="flex items-center justify-between px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                    <div className="flex items-center gap-2">
                      <i className="fa fa-globe"></i> Language
                    </div>
                    <div className="flex items-center gap-1 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                      English{" "}
                      <Image src="/amerika.png" alt="EN" width={14} height={14} />
                    </div>
                  </div>

                  {/* Dark Mode Switch */}
                  <div className="flex items-center justify-between px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                    <div className="flex items-center gap-2">
                      <i className="fa fa-moon"></i> Dark Mode
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={theme === "dark"}
                        onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                      />
                      <div className="w-9 h-5 bg-gray-300 rounded-full peer dark:bg-gray-600 after:content-[''] after:absolute after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-4"></div>
                    </label>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full mt-3 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-left text-red-600 font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function ThemeButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-3 py-1.5 rounded border transition-colors ${
        active
          ? label === "Light"
            ? "bg-yellow-400 text-white border-yellow-400"
            : "bg-gray-700 text-white border-gray-700"
          : "border-gray-300 dark:border-gray-600"
      }`}
    >
      <i className={`fa ${icon}`}></i> {label}
    </button>
  );
}

function MenuItem({
  icon,
  label,
  hasArrow,
}: {
  icon: string;
  label: string;
  hasArrow?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
      <div className="flex items-center gap-2">
        <i className={`fa ${icon}`}></i> {label}
      </div>
      {hasArrow && <i className="fa fa-chevron-right text-xs"></i>}
    </div>
  );
}

'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'ID'>('EN');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Hindari hydration error
  useEffect(() => setMounted(true), []);

  // Tutup dropdown bahasa ketika klik luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'EN', label: 'English', flag: '/amerika.png' },
    { code: 'ID', label: 'Indonesia', flag: '/indonesia.png' },
  ];
  const currentLang = languages.find((lang) => lang.code === language);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow transition-colors duration-300">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* KIRI: Logo & Tombol Sidebar Mobile */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 text-gray-700 dark:text-gray-200"
            onClick={onToggleSidebar}
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/favicon.png" alt="Logo" width={32} height={32} />
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Metronic
            </span>
          </Link>
        </div>

        {/* KANAN: Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">
          {/* Theme Switcher */}
          <ThemeButton icon="fa-sun" label="Light" active={theme === 'light'} onClick={() => setTheme('light')} />
          <ThemeButton icon="fa-moon" label="Dark" active={theme === 'dark'} onClick={() => setTheme('dark')} />

          {/* Language Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-1.5 border rounded border-gray-300 dark:border-gray-600"
            >
              <Image src={currentLang?.flag || '/amerika.png'} alt={language} width={20} height={20} />
              <span>{language}</span>
              <i className={`fa fa-chevron-down text-xs transition-transform ${isLangOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow rounded overflow-hidden z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as 'EN' | 'ID');
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

          {/* User Info */}
          <div className="flex items-center gap-2 cursor-pointer">
            <Image src="/avatars/default.png" alt="Avatar" width={36} height={36} className="rounded-full" />
            <span className="text-gray-900 dark:text-gray-100 font-medium">User</span>
          </div>
        </div>
      </div>
    </header>
  );
}

/* 🔹 Komponen Tombol Tema */
function ThemeButton({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-3 py-1.5 rounded border transition-colors ${
        active
          ? label === 'Light'
            ? 'bg-yellow-400 text-white border-yellow-400'
            : 'bg-gray-700 text-white border-gray-700'
          : 'border-gray-300 dark:border-gray-600'
      }`}
    >
      <i className={`fa ${icon}`}></i> {label}
    </button>
  );
}

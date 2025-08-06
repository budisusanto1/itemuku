'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { FiChevronRight } from 'react-icons/fi';
import * as LucideIcons from 'lucide-react'; // Import semua icon lucide-react

interface MenuItem {
  id: number;
  name: string;
  url: string;
  iconType: 'metronic' | 'lucide';
  icon: string;
  children?: MenuItem[];
}

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname();
  const { theme } = useTheme();

  const [menus] = useState<MenuItem[]>([
    {
      id: 1,
      name: 'Dashboard',
      url: '/dashboard',
      iconType: 'lucide',
      icon: 'LayoutGrid',
    },
   {
  id: 2,
  name: 'Master Data',
  url: '#',
  iconType: 'lucide',
 icon: 'ShieldUser', // ganti ke icon yang valid
  children: [
    { id: 21, name: 'Users', url: '/users', iconType: 'metronic', icon: 'Users' },
    { id: 22, name: 'Roles', url: '/roles', iconType: 'metronic', icon: 'ki-outline ki-lock' },
  ],
},

   {
  id: 3,
  name: 'Reports',
  url: '/reports',
  iconType: 'lucide',
  icon: 'ChartNoAxesColumnIncreasing', // ✅ sudah benar
},

    {
      id: 4,
      name: 'Produk',
      url: '/produk',
      iconType: 'lucide',
      icon: 'Package',
    },
  ]);

  return (
    <>
      {/* Sidebar untuk desktop */}
      <aside
        className={`hidden lg:flex fixed top-0 left-0 h-screen w-64 flex-col z-40 p-4 overflow-y-auto shadow-md transition-colors
          ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
        `}
      >
        <SidebarContent pathname={pathname} menus={menus} />
      </aside>

      {/* Sidebar untuk mobile */}
      {isOpen && (
        <aside
          className={`lg:hidden fixed top-0 left-0 h-screen w-64 flex-col z-50 p-4 overflow-y-auto shadow-md transition-transform duration-300
            ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <SidebarContent pathname={pathname} menus={menus} />
        </aside>
      )}
    </>
  );
}

function SidebarContent({ pathname, menus }: { pathname: string; menus: MenuItem[] }) {
  const renderIcon = (menu: MenuItem) => {
    if (menu.iconType === 'metronic') {
      return <i className={`${menu.icon} mr-2 text-lg`}></i>; // Icon Metronic
    }
    if (menu.iconType === 'lucide') {
      const LucideIcon = (LucideIcons as any)[menu.icon];
      return LucideIcon ? <LucideIcon className="w-5 h-5 mr-2" /> : null;
    }
    return null;
  };

  return (
    <>
      <div className="mb-6 text-center">
        <Link href="/">
          <img src="/default-logo.svg" alt="Logo" className="mx-auto h-12" />
        </Link>
      </div>

      <nav className="space-y-2">
        {menus.map((menu) => (
          <div key={menu.id}>
            {menu.url === '#' ? (
              <details className="group">
                <summary className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-all">
                  <span className="flex items-center">
                    {renderIcon(menu)}
                    {menu.name}
                  </span>
                  <FiChevronRight className="transition-transform group-open:rotate-90" />
                </summary>
                <div className="pl-6 mt-2 space-y-1">
                  {menu.children?.map((child) => (
                    <Link
                      key={child.id}
                      href={child.url}
                      className={`block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-all
                        ${pathname === child.url ? 'bg-gray-200 dark:bg-gray-700 font-semibold border-l-4 border-blue-500' : ''}
                      `}
                    >
                      {renderIcon(child)}
                      {child.name}
                    </Link>
                  ))}
                </div>
              </details>
            ) : (
              <Link
                href={menu.url}
                className={`flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-all
                  ${pathname === menu.url ? 'bg-gray-200 dark:bg-gray-700 font-semibold border-l-4 border-blue-500' : ''}
                `}
              >
                {renderIcon(menu)}
                {menu.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}

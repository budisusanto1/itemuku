'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="kt_app_footer" className="app-footer bg-white dark:bg-gray-900 border-t">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between py-3 px-4">
        {/* Copyright */}
        <div className="text-gray-900 dark:text-gray-200">
          <span className="text-muted mr-1">2016 &copy;</span>
          <Link
            href="https://dwansoft.com"
            target="_blank"
            className="text-gray-800 dark:text-gray-100 hover:text-primary"
          >
            Dwansoft
          </Link>
        </div>

        {/* Menu */}
        <ul className="flex space-x-4 mt-2 md:mt-0 text-sm font-semibold">
          <li>
            <Link
              href="https://dwansoft.com"
              target="_blank"
              className="text-gray-600 dark:text-gray-300 hover:text-primary"
            >
              Chat 1
            </Link>
          </li>
          <li>
            <Link
              href="https://dwansoft.com"
              target="_blank"
              className="text-gray-600 dark:text-gray-300 hover:text-primary"
            >
              Chat 2
            </Link>
          </li>
          <li>
            <Link
              href="https://dwansoft.com"
              target="_blank"
              className="text-gray-600 dark:text-gray-300 hover:text-primary"
            >
              Chat 3
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}

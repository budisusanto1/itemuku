'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus } from 'lucide-react';

function UserRow({ user }: { user: any }) {
  const [imgSrc, setImgSrc] = useState(user.avatar || '/avatar/blank.png');

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer">
      <td className="px-4 py-2">
        <Image
          src={imgSrc}
          alt="User Avatar"
          width={50}
          height={50}
          className="rounded-full border border-gray-300 dark:border-gray-600 object-cover"
          onError={() => setImgSrc('/avatar/blank.png')}
        />
      </td>
      <td className="px-4 py-2">{user.name || '-'}</td>
      <td className="px-4 py-2">{user.email || '-'}</td>
      <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{user.avatar || '-'}</td>
    </tr>
  );
}

export default function UserListTableView() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [originalUsers, setOriginalUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data || []);
        setOriginalUsers(data || []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
    fetchUsers();
  }, []);

  // Filtering logic
  const filteredUsers = originalUsers.filter((user) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      (user.name || '').toLowerCase().includes(search) ||
      (user.email || '').toLowerCase().includes(search) ||
      (user.avatar || '').toLowerCase().includes(search);

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus =
      userFilter === 'all' ||
      (userFilter === 'active' && user.status === 'active') ||
      (userFilter === 'inactive' && user.status === 'inactive');

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full mx-auto px-4 lg:px-6 max-w-[1320px] text-gray-900 dark:text-white">
      <div className="flex flex-col rounded-xl bg-white border border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-300 dark:border-gray-700 px-5 py-5">
          <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search users"
                className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Role Filter */}
            <select
              className="w-full sm:w-36 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>

            {/* User Status Filter */}
            <select
              className="w-full sm:w-36 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              value={userFilter}
              onChange={(e) => {
                setUserFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Add User Button (Shadcn UI Style) */}
          <button
            onClick={() => router.push('/users/create')}
            data-slot="button"
            className="cursor-pointer group focus-visible:outline-hidden inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-60 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-8.5 rounded-md px-3 gap-1.5 text-[0.8125rem] leading-[1.25rem] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-xs shadow-black/5"
          >
            <Plus className="w-4 h-4" />
            Add user
          </button>
        </div>

        {/* Card Table */}
        <div className="overflow-auto">
          <table className="w-full table-fixed border-collapse border-spacing-0 text-left text-sm font-normal border-separate border-gray-200 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <th className="px-5 py-3 w-[60px] border-b border-gray-300 dark:border-gray-600">Avatar</th>
                <th className="px-4 py-3 w-[300px] border-b border-gray-300 dark:border-gray-600">Name</th>
                <th className="px-4 py-3 w-[250px] border-b border-gray-300 dark:border-gray-600">Email</th>
                <th className="px-4 py-3 w-[175px] border-b border-gray-300 dark:border-gray-600">Avatar Path</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => <UserRow key={user.id || user.email} user={user} />)
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2.5 border-t border-gray-300 dark:border-gray-700 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="text-sm text-gray-500 dark:text-gray-400">Rows per page</span>
            <select
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <div className="ml-3 text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredUsers.length === 0 ? 0 : startIndex + 1} to{' '}
              {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} Users
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 rounded text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-30"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => Math.abs(currentPage - page) < 3)
              .map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}

            <button
              className="px-2 py-1 rounded text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-30"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

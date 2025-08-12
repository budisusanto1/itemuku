'use client';

import React, { Fragment } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useSession } from 'next-auth/react';

interface Products {
  id: string;
  kode: string | null;
  productname: string | null;
  categoryid: string | null;
  type: string | null;
  hargaBeli: number;
  hargaJual: number;
  status: boolean;
}

export default function ProductTablePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [data, setData] = useState<Products[]>([]);
  const [originalData, setOriginalData] = useState<Products[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const safeLower = (val: any) => (val ? val.toString().toLowerCase() : '');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const token = session?.user?.token;
        if (!token) {
          console.error('No token found');
          setLoading(false);
          return;
        }

        const response = await apiFetch('/product/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const res = await response.json();

        if (res.data && Array.isArray(res.data)) {
          const mappedData: Products[] = res.data.map((item: any) => ({
            id: item.productid,
            kode: item.productcode || '-',
            productname: item.productname || '-',
            categoryid: item.kategori_nama || '-',
            type: '',
            hargaBeli: item.harga_beli || 0,
            hargaJual: item.harga_jual || 0,
            status: true,
          }));

          setData(mappedData);
          setOriginalData(mappedData);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  const handleAddProduct = () => router.push('/produk/create');
  const handleEdit = (product: Products) => router.push(`/product/update?id=${product.id}`);

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus product ini?')) {
      await apiFetch(`/product/${id}`, { method: 'DELETE' });
      setData((prev) => prev.filter((p) => p.id !== id));
      setOriginalData((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const filteredProduct = originalData.filter((p) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      safeLower(p.kode).includes(search) ||
      safeLower(p.productname).includes(search) ||
      safeLower(p.categoryid).includes(search) ||
      safeLower(p.type).includes(search);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.status) ||
      (statusFilter === 'inactive' && !p.status);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProduct.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredProduct.slice(startIndex, startIndex + itemsPerPage);

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? currentData.map((p) => p.id) : []);
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const allChecked = currentData.length > 0 && selectedIds.length === currentData.length;

  const toggleExpandRow = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const allExpanded = currentData.length > 0 && expandedRows.length === currentData.length;

  const toggleExpandAll = () => {
    if (allExpanded) setExpandedRows([]);
    else setExpandedRows(currentData.map((p) => p.id));
  };

  const IconCollapseDown = () => (
    <svg
      className="w-4 h-4 inline-block"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
  const IconCollapseUp = () => (
    <svg
      className="w-4 h-4 inline-block"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );

  return (
    <div className="w-full mx-auto px-4 lg:px-6 max-w-[1320px] text-gray-900 dark:text-white">
      <div className="flex flex-col rounded-xl bg-white border border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-300 dark:border-gray-700 px-5 py-5">
          <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
            {/* Search */}
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
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Cari product"
                className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Status Filter */}
            <select
              className="w-full sm:w-36 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
                setCurrentPage(1);
              }}
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>

          {/* Button Tambah */}
          <button
            onClick={handleAddProduct}
            className="cursor-pointer group inline-flex items-center justify-center whitespace-nowrap font-medium bg-blue-600 text-white hover:bg-blue-700 h-8.5 rounded-md px-3 gap-1.5 text-sm focus-visible:ring-2 focus-visible:ring-blue-400 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Tambah Product
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm font-normal min-w-[700px]">
            <thead>
              <tr className="bg-gray-100 text-gray-500 font-bold uppercase text-[0.8rem]">
                <th
                  className="kv-align-center kv-align-middle skip-export kv-expand-header-cell kv-batch-toggle cursor-pointer"
                  title={allExpanded ? 'Collapse All' : 'Expand All'}
                  style={{ width: '3.73%' }}
                  onClick={toggleExpandAll}
                >
                  <div className={`kv-expand-header-icon ${allExpanded ? 'kv-state-expanded' : 'kv-state-collapsed'}`}>
                    {allExpanded ? <IconCollapseUp /> : <IconCollapseDown />}
                  </div>
                </th>

                <th className="text-center w-[40px] px-4 py-4">
                  <input type="checkbox" checked={allChecked} onChange={(e) => toggleSelectAll(e.target.checked)} />
                </th>

                <th className="text-center min-w-[80px] px-4 py-4">Action</th>
                <th className="text-center min-w-[80px] px-4 py-4">Code</th>
                <th className="text-center min-w-[150px] px-4 py-4">Product Name</th>
                <th className="hidden md:table-cell text-center min-w-[120px] px-4 py-4">Category name</th>
                <th className="hidden lg:table-cell text-center min-w-[120px] px-4 py-4">Product Type</th>
                <th className="text-center min-w-[100px] px-4 py-4">Sell Price</th>
                <th className="hidden lg:table-cell text-center min-w-[100px] px-4 py-4">Buy Price</th>
                <th className="text-center min-w-[90px] px-4 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-6">
                    Loading...
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-6">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                currentData.map((product) => (
                  <Fragment key={product.id}>
                    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td
                        className="kv-align-center kv-align-middle cursor-pointer px-4 py-4"
                        onClick={() => toggleExpandRow(product.id)}
                        title={expandedRows.includes(product.id) ? 'Collapse' : 'Expand'}
                      >
                        {expandedRows.includes(product.id) ? <IconCollapseUp /> : <IconCollapseDown />}
                      </td>

                      <td className="text-center px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleSelectOne(product.id)}
                        />
                      </td>

                      <td className="text-center px-4 py-4 relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === product.id ? null : product.id)}
                          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          <i className="fa-sharp fa-solid fa-list text-gray-600 dark:text-gray-300"></i>
                        </button>
                        {openDropdown === product.id && (
                          <ul className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700 z-10">
                            <li>
                              <a
                                onClick={() => router.push(`/product/detail/${product.id}`)}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              >
                                <i className="fas fa-eye text-blue-500"></i> Detail
                              </a>
                            </li>
                            <li>
                              <a
                                onClick={() => handleEdit(product)}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              >
                                <i className="fas fa-edit text-green-500"></i> Edit
                              </a>
                            </li>
                            <li>
                              <a
                                onClick={() => handleDelete(product.id)}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              >
                                <i className="fas fa-trash text-red-500"></i> Delete
                              </a>
                            </li>
                          </ul>
                        )}
                      </td>

                      <td className="text-center px-2 py-2">{product.kode || '-'}</td>
                      <td className="text-center px-2 py-2">{product.productname || '-'}</td>
                      <td className="hidden md:table-cell text-center px-2 py-2">{product.categoryid || '-'}</td>
                      <td className="hidden lg:table-cell text-center px-2 py-2">{product.type || '-'}</td>
                      <td className="text-center px-2 py-2">Rp {product.hargaJual.toLocaleString()}</td>
                      <td className="hidden lg:table-cell text-center px-2 py-2">Rp {product.hargaBeli.toLocaleString()}</td>
                      <td className="text-center px-2 py-2">
                        <span className={product.status ? 'text-green-600' : 'text-red-600'}>
                          {product.status ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                    </tr>

                    {/* Row tambahan untuk detail (expand) */}
                    {expandedRows.includes(product.id) && (
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <td colSpan={10} className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          <table className="w-full table-auto border border-gray-300 dark:border-gray-600 text-left text-xs sm:text-sm">
                            <thead>
                              <tr className="bg-gray-200 dark:bg-gray-700">
                                <th className="border border-gray-300 dark:border-gray-600 px-2 py-1">Field</th>
                                <th className="border border-gray-300 dark:border-gray-600 px-2 py-1">Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">Kode</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">{product.kode}</td>
                              </tr>
                              <tr>
                                <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">Nama Produk</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">{product.productname}</td>
                              </tr>
                              <tr>
                                <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">Kategori</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">{product.categoryid || '-'}</td>
                              </tr>
                              <tr>
                                <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">Jenis</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">{product.type || '-'}</td>
                              </tr>
                              <tr>
                                <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">Harga Jual</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">Rp {product.hargaJual.toLocaleString()}</td>
                              </tr>
                              <tr>
                                <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">Harga Beli</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">Rp {product.hargaBeli.toLocaleString()}</td>
                              </tr>
                              <tr>
                                <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">Status</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">
                                  <span className={product.status ? 'text-green-600' : 'text-red-600'}>
                                    {product.status ? 'Aktif' : 'Nonaktif'}
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2.5 border-t border-gray-300 px-5 py-3">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <span className="text-gray-500">Jumlah baris per halaman:</span>
            <select
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm">
              Halaman {currentPage} dari {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

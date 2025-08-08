'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useSession } from "next-auth/react";

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
  const [data, setData] = useState<Products[]>([]);
  const [originalData, setOriginalData] = useState<Products[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
   const { data: session } = useSession(); 
useEffect(() => {
  async function fetchData() {
    setLoading(true);

    try {
      const queryParams = new URLSearchParams({
        productname: searchQuery?.trim() || '',     
        size: itemsPerPage?.toString() || '10',     
        page: currentPage?.toString() || '1',      
      }).toString();

      // Fetch data dengan query param
    //  const response = await apiFetch(`/product/`, { method: 'GET' });

  // const session = await useSession();

  const user = session?.user || {
  name: 'Guest User',
  email: 'guest@example.com',
  image: '/avatars/default.png',
  role: 'User',
token: 'User',
};


  console.log(user.token);
  
  // Ambil token dari localStorage (hanya di client-side)
  const token = user.token;
    
      const response = await apiFetch('/product/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        // body: JSON.stringify(values),
      });

     const res = await response.json();

     

      // if (!res.success) {
      //   const { message } = await res.json();
      //   // setError(message || 'Failed to register. Please try again.');
      //   return;
      // }

            // const { message } = await res.json();

            // console.log(message);
      // setSuccess(true);
      // setTimeout(() => router.push('/'), 2000);


        // Mapping dari API ke struktur frontend
        const mappedData: Products[] = res.data.map((item: any) => ({
          id: item.productid,
          kode: item.productcode || '-',
          productname: item.productname || '-',
          categoryid: item.kategori_nama || '-', // sesuai field kategori_nama
          type: '', // API tidak mengirim product type
          hargaBeli: item.harga_beli || 0,
          hargaJual: item.harga_jual || 0,
          status: true // API tidak kirim status, defaultkan true
        }));
// console.info(mappedData);
        setData(mappedData);
        setOriginalData(mappedData);
    } catch (err) {
      // setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      // setIsProcessing(false);
      setLoading(false);
    }

    
      // const res = await response.json();

    //   if (res.success && Array.isArray(res.data)) {
    //     // Mapping dari API ke struktur frontend
    //     const mappedData: Products[] = res.data.map((item: any) => ({
    //       id: item.productid,
    //       kode: item.productcode || '-',
    //       productname: item.productname || '-',
    //       categoryid: item.kategori_nama || '-', // sesuai field kategori_nama
    //       type: '', // API tidak mengirim product type
    //       hargaBeli: item.harga_beli || 0,
    //       hargaJual: item.harga_jual || 0,
    //       status: true // API tidak kirim status, defaultkan true
    //     }));

    //     setData(mappedData);
    //     setOriginalData(mappedData);
    //   }
    // } catch (error) {
    //   console.error('Fetch error:', error);
    // } finally {
    //   setLoading(false);
    // }
  }

  fetchData();
}, [searchQuery, currentPage, itemsPerPage]);

  const handleAddProduct = () => {
    router.push('/produk/create');
  };

  const handleEdit = (products: Products) => {
    router.push(`/product/update?id=${products.id}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus product ini?')) {
      await apiFetch(`/product/${id}`, { method: 'DELETE' });
      setData((prev) => prev.filter((p) => p.id !== id));
      setOriginalData((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const safeLower = (val: any) => (val ? val.toString().toLowerCase() : '');

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
    if (checked) {
      setSelectedIds(currentData.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const allChecked = currentData.length > 0 && selectedIds.length === currentData.length;

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
                aria-hidden="true"
                viewBox="0 0 24 24"
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
                setStatusFilter(e.target.value);
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
            className="cursor-pointer group focus-visible:outline-hidden inline-flex items-center justify-center whitespace-nowrap font-medium bg-blue-600 text-white hover:bg-blue-700 h-8.5 rounded-md px-3 gap-1.5 text-sm focus-visible:ring-2 focus-visible:ring-blue-400 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Tambah Product
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm font-normal min-w-[700px]">
            <thead>
              <tr className="text-start bg-gray-100 text-gray-500 font-bold uppercase text-[0.8rem]">
                <th className="text-center w-[40px] px-4 py-4">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="text-center min-w-[80px] px-4 py-4">Action</th>
                <th className="text-center min-w-[80px] px-4 py-4">Code</th>
                <th className="text-center min-w-[150px] px-4 py-4">Product Name</th>
                <th className="hidden md:table-cell text-center min-w-[120px] px-4 py-4">
                  Category name
                </th>
                <th className="hidden lg:table-cell text-center min-w-[120px] px-4 py-4">
                  Product Type
                </th>
                <th className="text-center min-w-[100px] px-4 py-4">Sell Price</th>
                <th className="hidden lg:table-cell text-center min-w-[100px] px-4 py-4">
                  Buy Price
                </th>
                <th className="text-center min-w-[90px] px-4 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-6">Loading...</td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-6">Tidak ada data</td>
                </tr>
              ) : (
                currentData.map((products) => (
                  <tr
                    key={products.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors relative"
                  >
                    <td className="text-center px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(products.id)}
                        onChange={() => toggleSelectOne(products.id)}
                      />
                    </td>
                    <td className="text-center px-4 py-4 relative">
                      <button
                        onClick={() =>
                          setOpenDropdown(openDropdown === products.id ? null : products.id)
                        }
                        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <i className="fa-sharp fa-solid fa-list text-gray-600 dark:text-gray-300"></i>
                      </button>

                      {openDropdown === products.id && (
                        <ul className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700 z-10">
                          <li>
                            <a
                              onClick={() => router.push(`/product/detail/${products.id}`)}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            >
                              <i className="fas fa-eye text-blue-500"></i> Detail
                            </a>
                          </li>
                          <li>
                            <a
                              onClick={() => handleEdit(products)}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            >
                              <i className="fas fa-edit text-green-500"></i> Edit
                            </a>
                          </li>
                          <li>
                            <a
                              onClick={() => handleDelete(products.id)}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            >
                              <i className="fas fa-trash text-red-500"></i> Delete
                            </a>
                          </li>
                        </ul>
                      )}
                    </td>
                    <td className="text-center px-2 py-2">{products.kode || '-'}</td>
                    <td className="text-center px-2 py-2">{products.productname || '-'}</td>
                    <td className="hidden md:table-cell text-center px-2 py-2">
                      {products.categoryid || '-'}
                    </td>
                    <td className="hidden lg:table-cell text-center px-2 py-2">
                      {products.type || '-'}
                    </td>
                    <td className="text-center px-2 py-2">
                      Rp {products.hargaJual.toLocaleString()}
                    </td>
                    <td className="hidden lg:table-cell text-center px-2 py-2">
                      Rp {products.hargaBeli.toLocaleString()}
                    </td>
                    <td className="text-center px-2 py-2">
                      <span className={products.status ? 'text-green-600' : 'text-red-600'}>
                        {products.status ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2.5 border-t border-gray-300 px-5 py-3">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <span className="text-gray-500">Baris per halaman</span>
            <select
              className="rounded-md border border-gray-300 bg-white text-gray-900 px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
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
            <div className="ml-3 text-gray-500">
              Menampilkan {filteredProduct.length === 0 ? 0 : startIndex + 1} hingga{' '}
              {Math.min(startIndex + itemsPerPage, filteredProduct.length)} dari {filteredProduct.length} Product
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 rounded text-gray-400 hover:text-black disabled:opacity-30"
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
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

            <button
              className="px-2 py-1 rounded text-gray-400 hover:text-black disabled:opacity-30"
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

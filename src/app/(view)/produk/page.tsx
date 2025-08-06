'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Produk {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  jenis: string;
  hargaBeli: number;
  hargaJual: number;
  status: boolean;
}

export default function ProdukTablePage() {
  const [data, setData] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetch('/api/produk');
      const json = await res.json();
      setData(json.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleRowClick = (produk: Produk) => {
    router.push(`/produk/${produk.id}`); // ✅ klik baris menuju detail produk
  };

  const handleAddProduk = () => {
    router.push('/produk/create'); // ✅ tombol menuju halaman create
  };

  return (
    <div className="p-6">
      {/* Header + Button Input */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Daftar Produk</h1>
        <button
          onClick={handleAddProduk}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Tambah Produk
        </button>
      </div>

     
        <table className="table-auto w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Kode</th>
              <th className="p-2 border">Nama</th>
              <th className="p-2 border">Kategori</th>
              <th className="p-2 border">Jenis</th>
              <th className="p-2 border">Harga Beli</th>
              <th className="p-2 border">Harga Jual</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((produk) => (
              <tr
                key={produk.id}
                onClick={() => handleRowClick(produk)}
                className="cursor-pointer hover:bg-gray-100 transition"
              >
                <td className="p-2 border">{produk.kode}</td>
                <td className="p-2 border">{produk.nama}</td>
                <td className="p-2 border">{produk.kategori}</td>
                <td className="p-2 border">{produk.jenis}</td>
                <td className="p-2 border">Rp {produk.hargaBeli}</td>
                <td className="p-2 border">Rp {produk.hargaJual}</td>
                <td className="p-2 border">
                  <span className={produk.status ? 'text-green-600' : 'text-red-600'}>
                    {produk.status ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

    </div>
  );
}

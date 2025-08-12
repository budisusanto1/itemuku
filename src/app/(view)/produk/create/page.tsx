'use client';

import { useEffect, useState, useRef } from "react";
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { Dialog } from '@headlessui/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useSession } from "next-auth/react";

interface Option {
  label: string;
  value: string;
}

interface FormValues {
  kategori: Option | null;
  productname: string;
  jenis: Option | null;
  deskripsi?: string;
  hargabeli: number;
  hargajual: number;
}

export default function ProdukCreate() {
  const router = useRouter();
  const { data: session } = useSession();

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      kategori: null,
      jenis: null,
      deskripsi: '',
    }
  });

  const [kategoriOptions, setKategoriOptions] = useState<Option[]>([]);
  const [jenisOptions] = useState<Option[]>([
    { label: 'Fisik', value: 'fisik' },
    { label: 'Digital', value: 'digital' },
  ]);

  const [categoryModal, setCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchedRef = useRef(false);

  // Ambil kategori dari backend
  const getCategory = async () => {
    try {
      const res = await apiFetch('/public/category/', { method: 'GET' });
      const result = await res.json();

      if (result.status === 'success' && Array.isArray(result.categories)) {
        const options = result.categories.map((item: any) => ({
          label: item.CategoryTextId,
          value: item.CategoryId,
        }));
        setKategoriOptions(options);
      } else {
        console.error('Gagal ambil kategori:', result);
      }
    } catch (err) {
      console.error('Error ambil kategori:', err);
    }
  };

  useEffect(() => {
    if (!fetchedRef.current) {
      getCategory();
      fetchedRef.current = true;
    }
  }, []);

  const kategoriOptionsWithAdd = [
    ...kategoriOptions,
    { label: 'Tambah kategori baru', value: 'add' }
  ];

  // Tambah kategori baru ke opsi dan set di form
  const addCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      alert('Nama kategori tidak boleh kosong');
      return;
    }

    const exists = kategoriOptions.some(
      (opt) => opt.label.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      alert('Kategori sudah ada');
      return;
    }

    const newOpt = { label: trimmed, value: trimmed.toLowerCase() };
    setKategoriOptions(prev => [...prev, newOpt]);
    setValue('kategori', newOpt, { shouldValidate: true });
    setCategoryModal(false);
    setNewCategory('');
  };

  const onSubmit = async (data: FormValues) => {
    if (!session?.user?.token) {
      alert('Silakan login ulang, token tidak ditemukan');
      return;
    }

    if (!file) {
      alert('Gambar produk wajib diupload');
      return;
    }

    if (!data.kategori || !data.jenis) {
      alert('Kategori dan jenis wajib dipilih');
      return;
    }

    if (data.hargajual < data.hargabeli) {
      alert('Harga jual harus lebih besar atau sama dengan harga beli');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('companyid', 'UUID-COMPANY-AKTIF'); // sesuaikan dengan data asli
      formData.append('productname', data.productname);
      formData.append('jenis', data.jenis.value);
      formData.append('deskripsi', data.deskripsi || '');
      formData.append('kategoriid', data.kategori.value);
      formData.append('hargabeli', String(data.hargabeli));
      formData.append('hargajual', String(data.hargajual));
      formData.append('image', file);

      const res = await apiFetch('/product/', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${session.user.token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        alert(`Gagal simpan produk. Status: ${res.status}\nResponse: ${text}`);
        return;
      }

      const result = await res.json();
      if (result.success) {
        alert('Produk berhasil disimpan!');
        router.push('/produk');
      } else {
        alert('Gagal: ' + (result.pesan || 'Unknown error'));
      }
    } catch (error) {
      alert('Error saat mengirim data: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Handle preview gambar
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setPreviewImage(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Tambah Produk</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Kategori */}
        <div>
          <label className="block mb-1 font-medium">Kategori</label>
          <Controller
            name="kategori"
            control={control}
            rules={{ required: "Kategori wajib dipilih" }}
            render={({ field }) => (
              <Select
                {...field}
                options={kategoriOptionsWithAdd}
                placeholder="Pilih kategori"
                isClearable
                onChange={(val) => {
                  if (val?.value === 'add') setCategoryModal(true);
                  else field.onChange(val);
                }}
                value={field.value || null}
              />
            )}
          />
          {errors.kategori && <p className="text-red-500 text-sm">{errors.kategori.message}</p>}
        </div>

        {/* Nama Produk */}
        <div>
          <label className="block mb-1 font-medium">Nama Produk</label>
          <input
            {...register('productname', { required: 'Nama wajib diisi' })}
            className="border p-2 w-full rounded"
            type="text"
          />
          {errors.productname && <p className="text-red-500 text-sm">{errors.productname.message}</p>}
        </div>

        {/* Jenis */}
        <div>
          <label className="block mb-1 font-medium">Jenis</label>
          <Controller
            name="jenis"
            control={control}
            rules={{ required: 'Jenis wajib dipilih' }}
            render={({ field }) => (
              <Select
                {...field}
                options={jenisOptions}
                placeholder="Pilih jenis"
                isClearable
                onChange={field.onChange}
                value={field.value || null}
              />
            )}
          />
          {errors.jenis && <p className="text-red-500 text-sm">{errors.jenis.message}</p>}
        </div>

        {/* Deskripsi */}
        <textarea
          {...register('deskripsi')}
          rows={3}
          className="border p-2 w-full rounded"
          placeholder="Deskripsi produk..."
        />

        {/* Harga Beli & Harga Jual */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Harga Beli</label>
            <input
              type="number"
              {...register('hargabeli', {
                required: 'Harga beli wajib diisi',
                min: { value: 0, message: 'Harga beli minimal 0' },
                valueAsNumber: true,
              })}
              className="border p-2 w-full rounded"
              min={0}
            />
            {errors.hargabeli && <p className="text-red-500 text-sm">{errors.hargabeli.message}</p>}
          </div>
          <div>
            <label className="block mb-1 font-medium">Harga Jual</label>
            <input
              type="number"
              {...register('hargajual', {
                required: 'Harga jual wajib diisi',
                min: { value: 0, message: 'Harga jual minimal 0' },
                valueAsNumber: true,
              })}
              className="border p-2 w-full rounded"
              min={0}
            />
            {errors.hargajual && <p className="text-red-500 text-sm">{errors.hargajual.message}</p>}
          </div>
        </div>

        {/* Upload Gambar */}
        <div>
          <label className="block mb-1 font-medium">Gambar Produk</label>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="border p-2 w-full rounded"
          />
          {previewImage && (
            <Image
              src={previewImage}
              alt="Preview"
              width={100}
              height={100}
              className="mt-2 rounded"
              unoptimized
            />
          )}
        </div>

        <div className="text-right">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Menyimpan...' : 'Simpan Produk'}
          </button>
        </div>
      </form>

      {/* Modal Kategori */}
      <Dialog open={categoryModal} onClose={() => setCategoryModal(false)}>
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <Dialog.Panel className="bg-white p-6 rounded w-96">
            <Dialog.Title className="font-semibold mb-4">Tambah Kategori</Dialog.Title>
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="border p-2 w-full rounded"
              placeholder="Nama kategori baru"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCategory();
                }
              }}
              autoFocus
            />
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => setCategoryModal(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Batal
              </button>
              <button
                onClick={addCategory}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Simpan
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

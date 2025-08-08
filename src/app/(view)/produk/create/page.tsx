'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { Dialog } from '@headlessui/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface Option {
  label: string;
  value: string;
}

export default function ProdukCreate() {
  const router = useRouter();
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm();

  const [kategoriOptions, setKategoriOptions] = useState<Option[]>([
    { label: 'Kategori 1', value: 'UUID-KATEGORI-1' },
  ]);

  const [jenisOptions] = useState<Option[]>([
    { label: 'Fisik', value: 'fisik' },
    { label: 'Digital', value: 'digital' },
  ]);

  const [categoryModal, setCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const addCategory = () => {
    if (!newCategory.trim()) return;
    const newOpt = { label: newCategory, value: newCategory.toLowerCase() };
    setKategoriOptions([...kategoriOptions, newOpt]);
    setValue('kategori', newOpt);
    setCategoryModal(false);
    setNewCategory('');
  };

  const onSubmit = async (data: any) => {
    const formData = new FormData();

    const request = {
      companyid: 'UUID-COMPANY-AKTIF',
      productname: data.productname,
      jenis: data.jenis.value,
      deskripsi: data.deskripsi || '',
      kategoriid: data.kategori.value,
      hargabeli: data.hargabeli,
      hargajual: data.hargajual,
      image: file || null, // jika ada file, masukkan; jika tidak, null
    };


    const res = await apiFetch('/product/', { method: 'POST', body: JSON.stringify(request) });
    const result = await res.json();
    if (result.success) {
      alert('Produk berhasil disimpan!');
      router.push('/produk');
    } else {
      alert('Gagal: ' + result.pesan);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Tambah Produk</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Kategori */}
        <div>
          <label className="block mb-1 font-medium">Kategori</label>
          <Controller
            name="kategori"
            control={control}
            rules={{ required: 'Kategori wajib dipilih' }}
            render={({ field }) => (
              <Select
                value={field.value}
                options={[...kategoriOptions, { label: '+ Tambah Kategori', value: 'add' }]}
                onChange={(val) => (val?.value === 'add' ? setCategoryModal(true) : field.onChange(val))}
                placeholder="Pilih kategori"
              />
            )}
          />
          {errors.kategori && <p className="text-red-500 text-sm">{String(errors.kategori.message)}</p>}
        </div>

        {/* Nama Produk */}
        <div>
          <label className="block mb-1 font-medium">Nama Produk</label>
          <input {...register('productname', { required: 'Nama wajib diisi' })} className="border p-2 w-full rounded" />
        </div>

        {/* Jenis */}
        <div>
          <label className="block mb-1 font-medium">Jenis</label>
          <Controller
            name="jenis"
            control={control}
            rules={{ required: 'Jenis wajib dipilih' }}
            render={({ field }) => (<Select {...field} options={jenisOptions} placeholder="Pilih jenis" />)}
          />
        </div>

        {/* Deskripsi */}
        <textarea {...register('deskripsi')} rows={3} className="border p-2 w-full rounded" placeholder="Deskripsi produk..." />

        {/* Harga Beli & Harga Jual */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Harga Beli</label>
            <input type="number" {...register('hargabeli', { required: 'Harga beli wajib diisi' })} className="border p-2 w-full rounded" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Harga Jual</label>
            <input type="number" {...register('hargajual', { required: 'Harga jual wajib diisi' })} className="border p-2 w-full rounded" />
          </div>
        </div>

        {/* Upload Gambar */}
        <div>
          <label className="block mb-1 font-medium">Gambar Produk</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) {
                setFile(selectedFile);
                const reader = new FileReader();
                reader.onloadend = () => setPreviewImage(reader.result as string);
                reader.readAsDataURL(selectedFile);
              }
            }}
            className="border p-2 w-full rounded"
          />
          {previewImage && <Image src={previewImage} alt="Preview" width={100} height={100} className="mt-2 rounded" />}
        </div>

        <div className="text-right">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Simpan Produk</button>
        </div>
      </form>

      {/* Modal Kategori */}
      <Dialog open={categoryModal} onClose={() => setCategoryModal(false)}>
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <Dialog.Panel className="bg-white p-6 rounded w-96">
            <Dialog.Title className="font-semibold mb-4">Tambah Kategori</Dialog.Title>
            <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="border p-2 w-full rounded" />
            <div className="flex justify-end mt-4 gap-2">
              <button onClick={() => setCategoryModal(false)} className="bg-gray-300 px-4 py-2 rounded">Batal</button>
              <button onClick={addCategory} className="bg-blue-600 text-white px-4 py-2 rounded">Simpan</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

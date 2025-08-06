'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { Dialog } from '@headlessui/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Variant {
  image?: string | null;
  file?: File | null;
  hargaBeli: string;
  hargaJual: string;
  hargaGrosir: string;
  sku: string;
}

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

  const [variants, setVariants] = useState<Variant[]>([
    { hargaBeli: '', hargaJual: '', hargaGrosir: '', sku: '' },
  ]);

  const [categoryModal, setCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const addVariant = () => setVariants([...variants, { hargaBeli: '', hargaJual: '', hargaGrosir: '', sku: '' }]);
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));

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
    formData.append('companyid', 'UUID-COMPANY-AKTIF'); 
    formData.append('nama', data.nama);
    formData.append('jenis', data.jenis.value);
    formData.append('deskripsi', data.deskripsi || '');
    formData.append('kategoriid', data.kategori.value);

    variants.forEach((v, idx) => {
      formData.append(`variants[${idx}][sku]`, v.sku);
      formData.append(`variants[${idx}][hargaBeli]`, v.hargaBeli);
      formData.append(`variants[${idx}][hargaJual]`, v.hargaJual);
      formData.append(`variants[${idx}][hargaGrosir]`, v.hargaGrosir);
      if (v.file) formData.append(`variants[${idx}][image]`, v.file);
    });

    const res = await fetch('/api/produk', { method: 'POST', body: formData });
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
          <input {...register('nama', { required: 'Nama wajib diisi' })} className="border p-2 w-full rounded" />
        </div>

        {/* Jenis */}
        <div>
          <label className="block mb-1 font-medium">Jenis</label>
          <Controller name="jenis" control={control} rules={{ required: 'Jenis wajib dipilih' }}
            render={({ field }) => (<Select {...field} options={jenisOptions} placeholder="Pilih jenis" />)} />
        </div>

        {/* Deskripsi */}
        <textarea {...register('deskripsi')} rows={3} className="border p-2 w-full rounded" placeholder="Deskripsi produk..." />

        {/* Varian */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Varian Produk</h3>
          {variants.map((v, idx) => (
            <div key={idx} className="border p-4 rounded mb-3">
              <div className="flex justify-between mb-3">
                <h4 className="font-bold">Varian #{idx + 1}</h4>
                {idx > 0 && <button type="button" onClick={() => removeVariant(idx)} className="text-red-600 hover:underline">Hapus</button>}
              </div>

              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const updated = [...variants];
                    updated[idx].image = reader.result as string;
                    updated[idx].file = file;
                    setVariants(updated);
                  };
                  reader.readAsDataURL(file);
                }
              }} />
              {v.image && <Image src={v.image} alt="Preview" width={100} height={100} className="mt-2 rounded" />}

              <input type="number" placeholder="Harga Beli" className="border p-2 w-full mt-2 rounded"
                value={v.hargaBeli} onChange={(e) => { const up = [...variants]; up[idx].hargaBeli = e.target.value; setVariants(up); }} />
              <input type="number" placeholder="Harga Jual" className="border p-2 w-full mt-2 rounded"
                value={v.hargaJual} onChange={(e) => { const up = [...variants]; up[idx].hargaJual = e.target.value; setVariants(up); }} />
              <input type="number" placeholder="Harga Grosir" className="border p-2 w-full mt-2 rounded"
                value={v.hargaGrosir} onChange={(e) => { const up = [...variants]; up[idx].hargaGrosir = e.target.value; setVariants(up); }} />
              <input type="text" placeholder="SKU" className="border p-2 w-full mt-2 rounded"
                value={v.sku} onChange={(e) => { const up = [...variants]; up[idx].sku = e.target.value; setVariants(up); }} />
            </div>
          ))}
          <button type="button" onClick={addVariant} className="bg-green-600 text-white px-3 py-2 rounded mt-2">
            + Tambah Varian
          </button>
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

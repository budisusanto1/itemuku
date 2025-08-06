import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';
import { validate as isUuid } from 'uuid';

/* ==============================
   FUNGSI GENERATE KODE PRODUK
============================== */
async function generateNextKode(companyid: string) {
  const template = await prisma.company.findUnique({
    where: { companyid },
    select: { product_code: true },
  }).then(res => res?.product_code || 'P');

  const lastProduk = await prisma.produk.findFirst({
    where: { companyid, status: { not: 0 }, produkkode: { startsWith: `${template}-` } },
    orderBy: { produkkode: 'desc' },
    select: { produkkode: true },
  });

  let nextNumber = 1;
  if (lastProduk?.produkkode) {
    const match = lastProduk.produkkode.match(/\d+$/);
    if (match) nextNumber = parseInt(match[0], 10) + 1;
  }
  return `${template}-${String(nextNumber).padStart(5, '0')}`;
}

/* ==============================
   GET PRODUK (JOIN MANUAL)
============================== */
export async function GET() {
  try {
    // Ambil semua data produk, kategori, varian, varianharga sekaligus
    const [produkList, kategoriList, varianList, varianHargaList] = await Promise.all([
      prisma.produk.findMany(),
      prisma.kategori.findMany(),
      prisma.varian.findMany(),
      prisma.varianharga.findMany(),
    ]);

    // Gabungkan data produk dengan kategori, varian, dan harga secara manual
    const data = produkList.map((p) => {
      const kategori = kategoriList.find(k => k.kategoriid === p.kategoriid);
      const varian = varianList.filter(v => v.produkid === p.produkid);

      // Ambil harga beli & jual dari varian pertama jika ada
      const hargaBeli = varian.length > 0 
        ? varianHargaList.find(vh => vh.varianid === varian[0].varianid)?.harga_beli || 0 
        : 0;

      const hargaJual = varian.length > 0 
        ? varianHargaList.find(vh => vh.varianid === varian[0].varianid)?.harga_jual || 0 
        : 0;

      return {
        id: p.produkid,
        kode: p.produkkode,
        nama: p.namaproduk,
        kategori: kategori?.kategorinama || '-',
        jenis: p.jenis === 1 ? 'Fisik' : 'Digital',
        hargaBeli,
        hargaJual,
        status: p.status === 1,
        foto: varian[0]?.produkfoto || '',
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error GET produk:', err);
    return NextResponse.json({ success: false, pesan: err.message, data: [] }, { status: 500 });
  }
}

/* ==============================
   POST PRODUK (SIMPAN PRODUK, VARIAN, HARGA)
============================== */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const companyid = formData.get('companyid') as string;
    const nama = formData.get('nama') as string;
    const jenis = formData.get('jenis') as string;
    const deskripsi = formData.get('deskripsi') as string;
    const kategoriInput = formData.get('kategoriid') as string;
    const hargaBeli = parseFloat(formData.get('harga_beli') as string) || 0;
    const hargaJual = parseFloat(formData.get('harga_jual') as string) || 0;
    const file = formData.get('image') as File;

    // Validasi wajib
    if (!companyid) throw new Error('Company ID wajib dikirim');
    if (!nama) throw new Error('Nama produk wajib diisi');
    if (!kategoriInput) throw new Error('Kategori wajib diisi');
    if (hargaBeli <= 0 || hargaJual <= 0) throw new Error('Harga beli & jual wajib lebih dari 0');

    // Validasi kategori: cek apakah input adalah UUID atau nama kategori
    let kategoriUuid: string | null = null;
    if (isUuid(kategoriInput)) {
      kategoriUuid = kategoriInput;
    } else {
      const kategori = await prisma.kategori.findFirst({
        where: { kategorinama: { equals: kategoriInput, mode: 'insensitive' } },
      });
      if (!kategori) throw new Error(`Kategori "${kategoriInput}" tidak ditemukan`);
      kategoriUuid = kategori.kategoriid;
    }

    const nextKode = await generateNextKode(companyid);

    // Upload gambar produk (jika ada)
    let imageUrl = '';
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(process.cwd(), 'public/uploads', fileName);
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${fileName}`;
    }

    // Simpan produk
    const produk = await prisma.produk.create({
      data: {
        produkkode: nextKode,
        companyid,
        namaproduk: nama,
        kategoriid: kategoriUuid,
        jenis: jenis === 'fisik' ? 1 : 2,
        deskripsi_produk: deskripsi || '',
        status: 1,
      },
    });

    // Simpan varian produk
    const varian = await prisma.varian.create({
      data: {
        produkid: produk.produkid,
        sku: `${nextKode}-SKU`,
        stok: 0,
        status: 1,
        deskripsi,
        produkfoto: imageUrl,
      },
    });

    // Simpan harga varian
    await prisma.varianharga.create({
      data: {
        varianid: varian.varianid,
        harga_beli: hargaBeli,
        harga_jual: hargaJual,
      },
    });

    return NextResponse.json({
      success: true,
      pesan: 'Produk, foto, dan harga berhasil disimpan',
      kode: nextKode,
    });
  } catch (err: any) {
    console.error('Error POST produk:', err);
    return NextResponse.json({ success: false, pesan: err.message }, { status: 500 });
  }
}

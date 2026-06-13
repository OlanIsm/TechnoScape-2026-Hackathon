import { PrismaClient, OrderStatus, PoolStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Memulai proses seeding database...');

  // Clear existing data to avoid key duplicate errors on re-run
  await prisma.auditLog.deleteMany({});
  await prisma.distribution.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.collectivePool.deleteMany({});
  await prisma.priceTier.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.koperasi.deleteMany({});

  console.log('Database dibersihkan.');

  // 1. Buat Koperasi
  const kop1 = await prisma.koperasi.create({
    data: {
      name: 'Koperasi Sumber Makmur',
      address: 'Jl. Raya Tani No. 12, Jember',
    },
  });

  const kop2 = await prisma.koperasi.create({
    data: {
      name: 'Koperasi Tani Jaya',
      address: 'Jl. Kemakmuran No. 45, Banyuwangi',
    },
  });

  console.log('Koperasi berhasil dibuat.');

  // 2. Buat User Demo (Password: password123)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'admin@koperasi.com',
      password: hashedPassword,
      role: 'ADMIN_KOPERASI',
      koperasiId: kop1.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Joko Widodo',
      email: 'joko@koperasi.com',
      password: hashedPassword,
      role: 'ANGGOTA',
      koperasiId: kop2.id,
    },
  });

  console.log(
    'User demo berhasil dibuat. Login menggunakan email: admin@koperasi.com / password: password123',
  );

  // 3. Buat Supplier
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'CV Petrokimia Makmur',
      address: 'Kawasan Industri Gresik',
      phone: '031-3981234',
      email: 'sales@petrokimiamakmur.com',
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'PT Pupuk Indonesia Distribusi',
      address: 'Jl. Jenderal Sudirman No. 10, Jakarta',
      phone: '021-5798000',
      email: 'info@pupukindonesia.com',
    },
  });

  console.log('Supplier berhasil dibuat.');

  // Create Supplier User linked to supplier1
  await prisma.user.create({
    data: {
      name: 'Sales Petrokimia',
      email: 'supplier@petrokimia.com',
      password: hashedPassword,
      role: 'SUPPLIER',
      supplierId: supplier1.id,
    },
  });
  console.log(
    'User Supplier demo berhasil dibuat. Login menggunakan email: supplier@petrokimia.com / password: password123',
  );

  // 4. Buat Produk
  const pupukNPK = await prisma.product.create({
    data: {
      name: 'Pupuk NPK Phonska',
      description:
        'Pupuk majemuk NPK bersubsidi dan non-subsidi untuk padi dan palawija.',
      supplierId: supplier1.id,
    },
  });

  const pupukUrea = await prisma.product.create({
    data: {
      name: 'Pupuk Urea Granul',
      description:
        'Pupuk nitrogen konsentrasi tinggi untuk menyuburkan vegetasi tanaman.',
      supplierId: supplier2.id,
    },
  });

  console.log('Produk pupuk berhasil dibuat.');

  // 5. Buat Price Tiers (Skema Diskon Borongan)
  // Untuk NPK Phonska (Berdasarkan Figma: 120/200 kg target)
  await prisma.priceTier.createMany({
    data: [
      {
        productId: pupukNPK.id,
        minVolume: 0,
        maxVolume: 5000,
        pricePerKg: 10000,
      },
      {
        productId: pupukNPK.id,
        minVolume: 5000,
        maxVolume: 15000,
        pricePerKg: 9200,
      },
      {
        productId: pupukNPK.id,
        minVolume: 15000,
        maxVolume: 20000,
        pricePerKg: 8500,
      },
      {
        productId: pupukNPK.id,
        minVolume: 20000,
        maxVolume: null,
        pricePerKg: 7000,
      },
    ],
  });

  // Untuk Urea
  await prisma.priceTier.createMany({
    data: [
      {
        productId: pupukUrea.id,
        minVolume: 0,
        maxVolume: 100,
        pricePerKg: 8500,
      },
      {
        productId: pupukUrea.id,
        minVolume: 100,
        maxVolume: 500,
        pricePerKg: 7800,
      },
      {
        productId: pupukUrea.id,
        minVolume: 500,
        maxVolume: null,
        pricePerKg: 7000,
      },
    ],
  });

  console.log('Price Tiers berhasil dibuat.');

  // 6. Buat Pool Aktif ("Borong Bareng") sesuai Mock Figma
  const targetDeadline = new Date();
  targetDeadline.setDate(targetDeadline.getDate() + 7); // Sisa 7 Hari

  const poolNPK = await prisma.collectivePool.create({
    data: {
      name: 'Patungan NPK Phonska Sub-Wilayah Jember',
      status: PoolStatus.ACTIVE,
      productId: pupukNPK.id,
      deadline: targetDeadline,
    },
  });

  console.log('Collective Pool NPK aktif berhasil dibuat.');

  // 7. Masukkan Partisipan Lain agar progress bar di Figma terisi "120/200 kg"
  // Koperasi Tani Jaya (kop2) menyumbangkan 120 kg ke pool ini
  const orderPartisipan = await prisma.order.create({
    data: {
      status: OrderStatus.PENDING,
      koperasiId: kop2.id,
      collectivePoolId: poolNPK.id,
      totalPrice: 120 * 8500, // Menggunakan harga tier 120kg (Rp 8.500)
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: orderPartisipan.id,
      productId: pupukNPK.id,
      quantity: 120, // 120 kg
      priceAtPurchase: 8500,
    },
  });

  console.log('Partisipan awal ditambahkan ke Pool (Progress: 120 kg).');

  // 8. Histori Transaksi Bulanan untuk AI Forecasting (Menangani Masalah Grain Dataset Tanpa Tanggal)
  // Dataset hanya memiliki Bulan/Tahun. Maka kita petakan ke TANGGAL 1 setiap bulannya (YYYY-MM-01)
  const historiBulanan = [
    { tahun: 2025, bulan: 9, qty: 1200 }, // September 2025
    { tahun: 2025, bulan: 10, qty: 1450 }, // Oktober 2025
    { tahun: 2025, bulan: 11, qty: 1900 }, // November 2025
    { tahun: 2025, bulan: 12, qty: 2100 }, // Desember 2025
    { tahun: 2026, bulan: 1, qty: 1100 }, // Januari 2026
    { tahun: 2026, bulan: 2, qty: 1300 }, // Februari 2026
    { tahun: 2026, bulan: 3, qty: 1700 }, // Maret 2026
    { tahun: 2026, bulan: 4, qty: 2200 }, // April 2026
    { tahun: 2026, bulan: 5, qty: 2500 }, // Mei 2026
  ];

  for (const h of historiBulanan) {
    // Tanggal 1 pada bulan tersebut
    const tanggalHistori = new Date(h.tahun, h.bulan - 1, 1, 12, 0, 0);

    const oldOrder = await prisma.order.create({
      data: {
        status: OrderStatus.DELIVERED,
        koperasiId: kop1.id,
        totalPrice: h.qty * 8000,
        createdAt: tanggalHistori,
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: oldOrder.id,
        productId: pupukNPK.id,
        quantity: h.qty,
        priceAtPurchase: 8000,
        createdAt: tanggalHistori,
      },
    });
  }

  console.log(
    'Histori transaksi bulanan (YYYY-MM-01) berhasil di-seed untuk AI Forecasting.',
  );
  console.log('Proses Seeding Selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

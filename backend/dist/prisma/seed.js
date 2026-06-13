"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const dotenv = __importStar(require("dotenv"));
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
dotenv.config();
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Memulai proses seeding database...');
    await prisma.auditLog.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.collectivePool.deleteMany({});
    await prisma.priceTier.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.supplier.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.koperasi.deleteMany({});
    console.log('Database dibersihkan.');
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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const adminUser = await prisma.user.create({
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
    console.log('User demo berhasil dibuat. Login menggunakan email: admin@koperasi.com / password: password123');
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
    const pupukNPK = await prisma.product.create({
        data: {
            name: 'Pupuk NPK Phonska',
            description: 'Pupuk majemuk NPK bersubsidi dan non-subsidi untuk padi dan palawija.',
            supplierId: supplier1.id,
        },
    });
    const pupukUrea = await prisma.product.create({
        data: {
            name: 'Pupuk Urea Granul',
            description: 'Pupuk nitrogen konsentrasi tinggi untuk menyuburkan vegetasi tanaman.',
            supplierId: supplier2.id,
        },
    });
    console.log('Produk pupuk berhasil dibuat.');
    await prisma.priceTier.createMany({
        data: [
            { productId: pupukNPK.id, minVolume: 0, maxVolume: 5000, pricePerKg: 10000 },
            { productId: pupukNPK.id, minVolume: 5000, maxVolume: 15000, pricePerKg: 9200 },
            { productId: pupukNPK.id, minVolume: 15000, maxVolume: 25000, pricePerKg: 8500 },
            { productId: pupukNPK.id, minVolume: 25000, maxVolume: null, pricePerKg: 7000 },
        ],
    });
    await prisma.priceTier.createMany({
        data: [
            { productId: pupukUrea.id, minVolume: 0, maxVolume: 100, pricePerKg: 8500 },
            { productId: pupukUrea.id, minVolume: 100, maxVolume: 500, pricePerKg: 7800 },
            { productId: pupukUrea.id, minVolume: 500, maxVolume: null, pricePerKg: 7000 },
        ],
    });
    console.log('Price Tiers berhasil dibuat.');
    const targetDeadline = new Date();
    targetDeadline.setDate(targetDeadline.getDate() + 7);
    const poolNPK = await prisma.collectivePool.create({
        data: {
            name: 'Patungan NPK Phonska Sub-Wilayah Jember',
            status: client_1.PoolStatus.ACTIVE,
            productId: pupukNPK.id,
            deadline: targetDeadline,
        },
    });
    console.log('Collective Pool NPK aktif berhasil dibuat.');
    const orderPartisipan = await prisma.order.create({
        data: {
            status: client_1.OrderStatus.PENDING,
            koperasiId: kop2.id,
            collectivePoolId: poolNPK.id,
            totalPrice: 120 * 8500,
        },
    });
    await prisma.orderItem.create({
        data: {
            orderId: orderPartisipan.id,
            productId: pupukNPK.id,
            quantity: 120,
            priceAtPurchase: 8500,
        },
    });
    console.log('Partisipan awal ditambahkan ke Pool (Progress: 120 kg).');
    const historiBulanan = [
        { tahun: 2025, bulan: 9, qty: 1200 },
        { tahun: 2025, bulan: 10, qty: 1450 },
        { tahun: 2025, bulan: 11, qty: 1900 },
        { tahun: 2025, bulan: 12, qty: 2100 },
        { tahun: 2026, bulan: 1, qty: 1100 },
        { tahun: 2026, bulan: 2, qty: 1300 },
        { tahun: 2026, bulan: 3, qty: 1700 },
        { tahun: 2026, bulan: 4, qty: 2200 },
        { tahun: 2026, bulan: 5, qty: 2500 },
    ];
    for (const h of historiBulanan) {
        const tanggalHistori = new Date(h.tahun, h.bulan - 1, 1, 12, 0, 0);
        const oldOrder = await prisma.order.create({
            data: {
                status: client_1.OrderStatus.DELIVERED,
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
    console.log('Histori transaksi bulanan (YYYY-MM-01) berhasil di-seed untuk AI Forecasting.');
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
//# sourceMappingURL=seed.js.map
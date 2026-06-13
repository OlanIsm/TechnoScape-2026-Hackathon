"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const volumemind_service_1 = require("../volumemind/volumemind.service");
let DashboardService = class DashboardService {
    prisma;
    volumemindService;
    constructor(prisma, volumemindService) {
        this.prisma = prisma;
        this.volumemindService = volumemindService;
    }
    async getDashboardData(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { koperasi: true },
        });
        if (!user || !user.koperasiId) {
            return this.getMockDashboardData('Petani');
        }
        const koperasiId = user.koperasiId;
        const koperasiName = user.koperasi?.name ?? 'Koperasi Sumber Makmur';
        const orders = await this.prisma.order.findMany({
            where: {
                koperasiId,
                status: { in: [client_1.OrderStatus.CONFIRMED, client_1.OrderStatus.DELIVERED] },
            },
            include: {
                orderItems: {
                    include: {
                        product: {
                            include: { priceTiers: true },
                        },
                    },
                },
            },
        });
        let totalSavings = 0;
        let totalIncomingKg = 0;
        orders.forEach((order) => {
            order.orderItems.forEach((item) => {
                totalIncomingKg += item.quantity;
                const tiers = item.product.priceTiers;
                if (tiers && tiers.length > 0) {
                    const sortedTiers = [...tiers].sort((a, b) => a.minVolume - b.minVolume);
                    const retailPrice = sortedTiers[0].pricePerKg;
                    const purchasePrice = item.priceAtPurchase;
                    if (retailPrice > purchasePrice) {
                        totalSavings += (retailPrice - purchasePrice) * item.quantity;
                    }
                }
            });
        });
        const distributions = await this.prisma.distribution.findMany({
            where: { koperasiId },
        });
        let totalSoldKg = 0;
        let totalRevenue = 0;
        distributions.forEach((dist) => {
            totalSoldKg += dist.quantity;
            totalRevenue += dist.totalPrice;
        });
        const netStockKg = Math.max(0, totalIncomingKg - totalSoldKg);
        const keuntungan = (orders.length === 0 && distributions.length === 0) ? 2450000 : totalSavings;
        const angka_kg = (orders.length === 0 && distributions.length === 0) ? 1500 : netStockKg;
        const angka_bulan = (orders.length === 0 && distributions.length === 0) ? 3 : Math.max(1, Math.ceil(netStockKg / 500));
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const targetDateStr = nextMonth.toISOString().split('T')[0];
        const nextMonthVal = nextMonth.getMonth() + 1;
        const isWetSeason = nextMonthVal >= 10 || nextMonthVal <= 4;
        const curahHujan = isWetSeason ? 280.0 : 120.0;
        const musimTanam = isWetSeason ? 'Rendengan' : 'Gadu';
        const defaultProduct = await this.prisma.product.findFirst({
            where: { name: 'Pupuk NPK Phonska' },
            include: {
                supplier: true,
                priceTiers: true,
            },
        });
        const fallbackSupplierName = defaultProduct?.supplier?.name ?? 'CV Petrokimia Makmur';
        const fallbackUnitPrice = defaultProduct?.priceTiers[0]?.pricePerKg ?? 8500;
        const fallbackTotalCost = 4500.0 * fallbackUnitPrice;
        let predictedDemandKg = 4500.0;
        let accuracy = 76.8;
        let rekomendasiVolumeMind = {
            bulan_1: nextMonth.toLocaleString('id-ID', { month: 'long' }),
            bulan_2: new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1).toLocaleString('id-ID', { month: 'long' }),
            angka_kg: 4500.0,
            statusRecom: 'PENDING',
            supplierName: fallbackSupplierName,
            unitPrice: fallbackUnitPrice,
            totalCost: fallbackTotalCost,
            isVolumeHack: false,
            extraVolumeGained: 0,
            savingsRp: 0,
            explanation: 'Membeli pupuk sesuai kebutuhan bulan depan.',
        };
        try {
            const dbSuppliers = await this.prisma.supplier.findMany({
                include: {
                    products: {
                        where: { name: 'Pupuk NPK Phonska' },
                        include: { priceTiers: true },
                    },
                },
            });
            const formattedSuppliers = dbSuppliers
                .filter(s => s.products.length > 0)
                .map(s => ({
                name: s.name,
                tiers: s.products[0].priceTiers.map(t => ({
                    min_volume: t.minVolume,
                    max_volume: t.maxVolume ?? null,
                    price_per_kg: t.pricePerKg,
                })),
            }));
            if (formattedSuppliers.length > 0) {
                const recommendResult = await this.volumemindService.getRecommendation({
                    tanggal: targetDateStr,
                    id_koperasi: koperasiName,
                    jenis_pupuk: 'Pupuk NPK Phonska',
                    curah_hujan_mm: curahHujan,
                    musim_tanam: musimTanam,
                    luas_lahan_hektar: 500.0,
                    suppliers: formattedSuppliers,
                    target_date: targetDateStr,
                });
                rekomendasiVolumeMind = {
                    bulan_1: nextMonth.toLocaleString('id-ID', { month: 'long' }),
                    bulan_2: new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1).toLocaleString('id-ID', { month: 'long' }),
                    angka_kg: recommendResult.recommended_volume_kg,
                    statusRecom: 'PENDING',
                    supplierName: recommendResult.recommended_supplier,
                    unitPrice: recommendResult.unit_price_per_kg,
                    totalCost: recommendResult.total_cost,
                    isVolumeHack: recommendResult.is_volume_hack,
                    extraVolumeGained: recommendResult.extra_volume_gained_kg,
                    savingsRp: recommendResult.savings_rp,
                    explanation: recommendResult.explanation,
                };
                predictedDemandKg = recommendResult.predicted_demand_kg;
            }
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.warn('Gagal memanggil VolumeMind AI Engine API, menggunakan simulasi fallback:', message);
        }
        return {
            userName: user.name,
            koperasiName: user.koperasi?.name ?? 'Koperasi Tanpa Nama',
            hematBulanIni: keuntungan,
            stokPupukKg: angka_kg,
            stokCukupBulan: angka_bulan,
            akurasiPrediksi: accuracy,
            totalSoldKg: (orders.length === 0 && distributions.length === 0) ? 850 : totalSoldKg,
            totalRevenue: (orders.length === 0 && distributions.length === 0) ? 7650000 : totalRevenue,
            rekomendasiVolumeMind,
        };
    }
    async getVolumeMindSummary(query) {
        const { tanggal, id_koperasi, jenis_pupuk, curah_hujan_mm, musim_tanam, luas_lahan_hektar, } = query;
        const curahHujanNum = Number(curah_hujan_mm);
        const luasLahanNum = Number(luas_lahan_hektar);
        const dbSuppliers = await this.prisma.supplier.findMany({
            include: {
                products: {
                    where: { name: { contains: jenis_pupuk, mode: 'insensitive' } },
                    include: { priceTiers: true },
                },
            },
        });
        const formattedSuppliers = dbSuppliers
            .filter(s => s.products.length > 0)
            .map(s => ({
            name: s.name,
            tiers: s.products[0].priceTiers.map(t => ({
                min_volume: t.minVolume,
                max_volume: t.maxVolume ?? null,
                price_per_kg: t.pricePerKg,
            })),
        }));
        let suppliersToUse = formattedSuppliers;
        if (suppliersToUse.length === 0) {
            const allSuppliers = await this.prisma.supplier.findMany({
                include: {
                    products: {
                        include: { priceTiers: true },
                    },
                },
            });
            suppliersToUse = allSuppliers
                .filter(s => s.products.length > 0)
                .map(s => ({
                name: s.name,
                tiers: s.products[0].priceTiers.map(t => ({
                    min_volume: t.minVolume,
                    max_volume: t.maxVolume ?? null,
                    price_per_kg: t.pricePerKg,
                })),
            }));
        }
        return this.volumemindService.getRecommendation({
            tanggal,
            id_koperasi,
            jenis_pupuk,
            curah_hujan_mm: curahHujanNum,
            musim_tanam,
            luas_lahan_hektar: luasLahanNum,
            suppliers: suppliersToUse,
            target_date: tanggal,
        });
    }
    getMockDashboardData(userName) {
        return {
            userName,
            koperasiName: 'Koperasi Tani Makmur',
            hematBulanIni: 2450000,
            stokPupukKg: 1500,
            stokCukupBulan: 3,
            akurasiPrediksi: 94.2,
            totalSoldKg: 850,
            totalRevenue: 7650000,
            rekomendasiVolumeMind: {
                bulan_1: 'Oktober',
                bulan_2: 'November',
                angka_kg: 4500,
                statusRecom: 'PENDING',
                supplierName: 'CV Petrokimia Makmur',
                unitPrice: 7000,
                totalCost: 31500000,
                isVolumeHack: true,
                extraVolumeGained: 4108,
                savingsRp: 2600000,
                explanation: 'VOLUME HACK! Beli lebih banyak (25000.0 kg) dari CV Petrokimia Makmur untuk menembus tier harga murah Rp 7000.00/kg (Hemat Rp 2.6Jt).',
            },
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        volumemind_service_1.VolumemindService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map
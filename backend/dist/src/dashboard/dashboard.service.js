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
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
        let totalStockKg = 0;
        orders.forEach((order) => {
            order.orderItems.forEach((item) => {
                totalStockKg += item.quantity;
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
        const isNewKoperasi = orders.length === 0;
        const keuntungan = isNewKoperasi ? 2450000 : totalSavings;
        const angka_kg = isNewKoperasi ? 1500 : totalStockKg;
        const angka_bulan = isNewKoperasi ? 3 : Math.max(1, Math.ceil(totalStockKg / 500));
        const accuracy = 94.2;
        const rekomendasiVolumeMind = {
            bulan_1: 'Oktober',
            bulan_2: 'November',
            angka_kg: isNewKoperasi ? 4500 : Math.ceil(angka_kg * 1.5),
            statusRecom: 'PENDING',
        };
        return {
            userName: user.name,
            koperasiName: user.koperasi?.name ?? 'Koperasi Tanpa Nama',
            hematBulanIni: keuntungan,
            stokPupukKg: angka_kg,
            stokCukupBulan: angka_bulan,
            akurasiPrediksi: accuracy,
            rekomendasiVolumeMind,
        };
    }
    getMockDashboardData(userName) {
        return {
            userName,
            koperasiName: 'Koperasi Tani Makmur',
            hematBulanIni: 2450000,
            stokPupukKg: 1500,
            stokCukupBulan: 3,
            akurasiPrediksi: 94.2,
            rekomendasiVolumeMind: {
                bulan_1: 'Oktober',
                bulan_2: 'November',
                angka_kg: 4500,
                statusRecom: 'PENDING',
            },
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map
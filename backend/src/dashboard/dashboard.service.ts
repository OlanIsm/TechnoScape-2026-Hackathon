import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { VolumemindService } from '../volumemind/volumemind.service';

export interface VolumeMindResponse {
  recommended_volume_kg: number;
  recommended_supplier: string;
  unit_price_per_kg: number;
  total_cost: number;
  is_volume_hack: boolean;
  extra_volume_gained_kg: number;
  savings_rp: number;
  explanation: string;
  predicted_demand_kg: number;
}

interface VolumeMindRecomState {
  bulan_1: string;
  bulan_2: string;
  angka_kg: number;
  statusRecom: string;
  supplierName: string;
  unitPrice: number;
  totalCost: number;
  isVolumeHack: boolean;
  extraVolumeGained: number;
  savingsRp: number;
  explanation: string;
}

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private volumemindService: VolumemindService,
  ) {}

  async getDashboardData(userId: string) {
    // 1. Dapatkan Koperasi dari User
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { koperasi: true },
    });

    if (!user || !user.koperasiId) {
      return this.getMockDashboardData('Petani');
    }

    const koperasiId = user.koperasiId;
    const koperasiName = user.koperasi?.name ?? 'Koperasi Sumber Makmur';

    // 2. Cari semua order koperasi yang statusnya CONFIRMED / DELIVERED
    const orders = await this.prisma.order.findMany({
      where: {
        koperasiId,
        status: { in: [OrderStatus.CONFIRMED, OrderStatus.DELIVERED] },
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

    // Hitung penghematan berdasarkan perbedaan harga beli dengan harga eceran biasa (tier terendah)
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        totalIncomingKg += item.quantity;

        const tiers = item.product.priceTiers;
        if (tiers && tiers.length > 0) {
          const sortedTiers = [...tiers].sort(
            (a, b) => a.minVolume - b.minVolume,
          );
          const retailPrice = sortedTiers[0].pricePerKg; // Harga eceran termahal
          const purchasePrice = item.priceAtPurchase;

          if (retailPrice > purchasePrice) {
            totalSavings += (retailPrice - purchasePrice) * item.quantity;
          }
        }
      });
    });

    // Cari semua data distribusi (stok keluar)
    const distributions = await this.prisma.distribution.findMany({
      where: { koperasiId },
    });

    let totalSoldKg = 0;
    let totalRevenue = 0;
    distributions.forEach((dist) => {
      totalSoldKg += dist.quantity;
      totalRevenue += dist.totalPrice;
    });

    // Hitung sisa sisa stok net
    const netStockKg = Math.max(0, totalIncomingKg - totalSoldKg);

    // Default values
    const keuntungan =
      orders.length === 0 && distributions.length === 0
        ? 2450000
        : totalSavings;
    const angka_kg =
      orders.length === 0 && distributions.length === 0 ? 1500 : netStockKg;
    const angka_bulan =
      orders.length === 0 && distributions.length === 0
        ? 3
        : Math.max(1, Math.ceil(netStockKg / 500)); // asumsi konsumsi 500kg/bulan

    // 3. Panggil VolumeMind AI Engine untuk Prediksi & Rekomendasi
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const targetDateStr = nextMonth.toISOString().split('T')[0]; // Format: YYYY-MM-01

    const nextMonthVal = nextMonth.getMonth() + 1;
    const isWetSeason = nextMonthVal >= 10 || nextMonthVal <= 4;
    const curahHujan = isWetSeason ? 280.0 : 120.0;
    const musimTanam = isWetSeason ? 'Rendengan' : 'Gadu';

    // Dapatkan supplier pertama dari database untuk fallback
    const defaultProduct = await this.prisma.product.findFirst({
      where: { name: 'Pupuk NPK Phonska' },
      include: {
        supplier: true,
        priceTiers: true,
      },
    });

    const fallbackSupplierName =
      defaultProduct?.supplier?.name ?? 'CV Petrokimia Makmur';
    const fallbackUnitPrice = defaultProduct?.priceTiers[0]?.pricePerKg ?? 8500;
    const fallbackTotalCost = 4500.0 * fallbackUnitPrice;

    const accuracy = 76.8; // Akurasi dari retraining model Random Forest
    let rekomendasiVolumeMind: VolumeMindRecomState = {
      bulan_1: nextMonth.toLocaleString('id-ID', { month: 'long' }),
      bulan_2: new Date(
        nextMonth.getFullYear(),
        nextMonth.getMonth() + 1,
        1,
      ).toLocaleString('id-ID', { month: 'long' }),
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
      // Dapatkan Rekomendasi Pembelian & Volume Hack
      const dbSuppliers = await this.prisma.supplier.findMany({
        include: {
          products: {
            where: { name: 'Pupuk NPK Phonska' },
            include: { priceTiers: true },
          },
        },
      });

      const formattedSuppliers = dbSuppliers
        .filter((s) => s.products.length > 0)
        .map((s) => ({
          name: s.name,
          tiers: s.products[0].priceTiers.map((t) => ({
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
          bulan_2: new Date(
            nextMonth.getFullYear(),
            nextMonth.getMonth() + 1,
            1,
          ).toLocaleString('id-ID', { month: 'long' }),
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
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(
        'Gagal memanggil VolumeMind AI Engine API, menggunakan simulasi fallback:',
        message,
      );
    }

    return {
      userName: user.name,
      koperasiName: user.koperasi?.name ?? 'Koperasi Tanpa Nama',
      hematBulanIni: keuntungan,
      stokPupukKg: angka_kg,
      stokCukupBulan: angka_bulan,
      akurasiPrediksi: accuracy,
      totalSoldKg:
        orders.length === 0 && distributions.length === 0 ? 850 : totalSoldKg,
      totalRevenue:
        orders.length === 0 && distributions.length === 0
          ? 7650000
          : totalRevenue,
      rekomendasiVolumeMind,
    };
  }

  async getVolumeMindSummary(query: {
    tanggal: string;
    id_koperasi: string;
    jenis_pupuk: string;
    curah_hujan_mm: string | number;
    musim_tanam: string;
    luas_lahan_hektar: string | number;
  }) {
    const {
      tanggal,
      id_koperasi,
      jenis_pupuk,
      curah_hujan_mm,
      musim_tanam,
      luas_lahan_hektar,
    } = query;

    const curahHujanNum = Number(curah_hujan_mm);
    const luasLahanNum = Number(luas_lahan_hektar);

    // Pull supplier data from database matching the product type (case-insensitive contains)
    const dbSuppliers = await this.prisma.supplier.findMany({
      include: {
        products: {
          where: { name: { contains: jenis_pupuk, mode: 'insensitive' } },
          include: { priceTiers: true },
        },
      },
    });

    const formattedSuppliers = dbSuppliers
      .filter((s) => s.products.length > 0)
      .map((s) => ({
        name: s.name,
        tiers: s.products[0].priceTiers.map((t) => ({
          min_volume: t.minVolume,
          max_volume: t.maxVolume ?? null,
          price_per_kg: t.pricePerKg,
        })),
      }));

    // If no supplier sells this specific product, try pulling all suppliers/products as fallback
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
        .filter((s) => s.products.length > 0)
        .map((s) => ({
          name: s.name,
          tiers: s.products[0].priceTiers.map((t) => ({
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

  private getMockDashboardData(userName: string) {
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
        explanation:
          'VOLUME HACK! Beli lebih banyak (25000.0 kg) dari CV Petrokimia Makmur untuk menembus tier harga murah Rp 7000.00/kg (Hemat Rp 2.6Jt).',
      },
    };
  }
}

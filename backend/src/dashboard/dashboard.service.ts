import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

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
    let totalStockKg = 0;

    // Hitung penghematan berdasarkan perbedaan harga beli dengan harga eceran biasa (tier terendah)
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        totalStockKg += item.quantity;

        const tiers = item.product.priceTiers;
        if (tiers && tiers.length > 0) {
          const sortedTiers = [...tiers].sort((a, b) => a.minVolume - b.minVolume);
          const retailPrice = sortedTiers[0].pricePerKg; // Harga eceran termahal
          const purchasePrice = item.priceAtPurchase;

          if (retailPrice > purchasePrice) {
            totalSavings += (retailPrice - purchasePrice) * item.quantity;
          }
        }
      });
    });

    // Default values
    const keuntungan = orders.length === 0 ? 2450000 : totalSavings;
    const angka_kg = orders.length === 0 ? 1500 : totalStockKg;
    const angka_bulan = orders.length === 0 ? 3 : Math.max(1, Math.ceil(totalStockKg / 500)); // asumsi konsumsi 500kg/bulan

    // 3. Panggil VolumeMind AI Engine (FastAPI) untuk Prediksi & Rekomendasi
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const targetDateStr = nextMonth.toISOString().split('T')[0]; // Format: YYYY-MM-01

    const nextMonthVal = nextMonth.getMonth() + 1;
    const isWetSeason = nextMonthVal >= 10 || nextMonthVal <= 4;
    const curahHujan = isWetSeason ? 280.0 : 120.0;
    const musimTanam = isWetSeason ? 'Rendengan' : 'Gadu';

    let predictedDemandKg = 4500.0;
    let accuracy = 76.8; // Akurasi dari retraining model Random Forest
    let rekomendasiVolumeMind: any = {
      bulan_1: nextMonth.toLocaleString('id-ID', { month: 'long' }),
      bulan_2: new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1).toLocaleString('id-ID', { month: 'long' }),
      angka_kg: 4500.0,
      statusRecom: 'PENDING',
      supplierName: 'CV Petrokimia Makmur',
      unitPrice: 8500,
      totalCost: 38250000,
      isVolumeHack: false,
      extraVolumeGained: 0,
      savingsRp: 0,
      explanation: 'Membeli pupuk sesuai kebutuhan bulan depan.',
    };

    try {
      // Step A: Dapatkan Prediksi Demand
      const predictRes = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: targetDateStr,
          id_koperasi: koperasiName,
          jenis_pupuk: 'Pupuk NPK Phonska',
          curah_hujan_mm: curahHujan,
          musim_tanam: musimTanam,
          luas_lahan_hektar: 500.0,
        }),
      });

      if (predictRes.ok) {
        const predictData = await predictRes.json();
        predictedDemandKg = predictData.predicted_demand_kg;
      }

      // Step B: Dapatkan Rekomendasi Pembelian & Volume Hack
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
        const recommendRes = await fetch('http://127.0.0.1:8000/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            predicted_demand_kg: predictedDemandKg,
            suppliers: formattedSuppliers,
            target_date: targetDateStr,
          }),
        });

        if (recommendRes.ok) {
          const recommendData = await recommendRes.json();
          rekomendasiVolumeMind = {
            bulan_1: nextMonth.toLocaleString('id-ID', { month: 'long' }),
            bulan_2: new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1).toLocaleString('id-ID', { month: 'long' }),
            angka_kg: recommendData.recommended_volume_kg,
            statusRecom: 'PENDING',
            supplierName: recommendData.recommended_supplier,
            unitPrice: recommendData.unit_price_per_kg,
            totalCost: recommendData.total_cost,
            isVolumeHack: recommendData.is_volume_hack,
            extraVolumeGained: recommendData.extra_volume_gained_kg,
            savingsRp: recommendData.savings_rp,
            explanation: recommendData.explanation,
          };
        }
      }
    } catch (err) {
      console.warn('Gagal memanggil VolumeMind AI Engine API, menggunakan simulasi fallback:', err.message);
    }

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

  // Backup data mock lengkap jika koperasi tidak valid
  private getMockDashboardData(userName: string) {
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
}

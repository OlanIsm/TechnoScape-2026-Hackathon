import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardData(userId: string): Promise<{
        userName: string;
        koperasiName: string;
        hematBulanIni: number;
        stokPupukKg: number;
        stokCukupBulan: number;
        akurasiPrediksi: number;
        rekomendasiVolumeMind: {
            bulan_1: string;
            bulan_2: string;
            angka_kg: number;
            statusRecom: string;
        };
    }>;
    private getMockDashboardData;
}

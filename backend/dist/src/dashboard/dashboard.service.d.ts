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
        rekomendasiVolumeMind: any;
    }>;
    private getMockDashboardData;
}

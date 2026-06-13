import { PrismaService } from '../prisma/prisma.service';
import { VolumemindService } from '../volumemind/volumemind.service';
export declare class DashboardService {
    private prisma;
    private volumemindService;
    constructor(prisma: PrismaService, volumemindService: VolumemindService);
    getDashboardData(userId: string): Promise<{
        userName: string;
        koperasiName: string;
        hematBulanIni: number;
        stokPupukKg: number;
        stokCukupBulan: number;
        akurasiPrediksi: number;
        totalSoldKg: number;
        totalRevenue: number;
        rekomendasiVolumeMind: any;
    }>;
    getVolumeMindSummary(query: {
        tanggal: string;
        id_koperasi: string;
        jenis_pupuk: string;
        curah_hujan_mm: string | number;
        musim_tanam: string;
        luas_lahan_hektar: string | number;
    }): Promise<any>;
    private getMockDashboardData;
}

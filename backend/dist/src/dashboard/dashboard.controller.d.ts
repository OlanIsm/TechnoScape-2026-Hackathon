import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboard(req: any): Promise<{
        userName: string;
        koperasiName: string;
        hematBulanIni: number;
        stokPupukKg: number;
        stokCukupBulan: number;
        akurasiPrediksi: number;
        rekomendasiVolumeMind: any;
    }>;
}

// volumemind.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class VolumemindService {
    private readonly baseUrl = 'http://localhost:8000'; // sesuaiin port dia

    async getRecommendation(payload: {
        tanggal: string;
        id_koperasi: string;
        jenis_pupuk: string;
        curah_hujan_mm: number;
        musim_tanam: string;
        luas_lahan_hektar: number;
        suppliers: any[];
        target_date?: string;
    }) {
        // Step 1: Predict
        const predictRes = await fetch(`${this.baseUrl}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tanggal: payload.tanggal,
                id_koperasi: payload.id_koperasi,
                jenis_pupuk: payload.jenis_pupuk,
                curah_hujan_mm: payload.curah_hujan_mm,
                musim_tanam: payload.musim_tanam,
                luas_lahan_hektar: payload.luas_lahan_hektar,
            }),
        });
        const predictData = await predictRes.json();

        // Step 2: Recommend
        const recommendRes = await fetch(`${this.baseUrl}/recommend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                predicted_demand_kg: predictData.predicted_demand_kg,
                suppliers: payload.suppliers,
                target_date: payload.target_date,
            }),
        });
        const recommendData = await recommendRes.json();

        return {
            predicted_demand_kg: predictData.predicted_demand_kg,
            ...recommendData,
        };
    }
}
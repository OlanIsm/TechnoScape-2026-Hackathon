// volumemind.service.ts
import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';

interface PredictResult {
  predicted_demand_kg: number;
}

interface RecommendResult {
  recommended_volume_kg: number;
  recommended_supplier: string;
  unit_price_per_kg: number;
  total_cost: number;
  is_volume_hack: boolean;
  extra_volume_gained_kg: number;
  savings_rp: number;
  explanation: string;
}

@Injectable()
export class VolumemindService {
  private readonly baseUrl =
    process.env.VOLUMEMIND_URL || 'http://localhost:8000';

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
    try {
      // Step 1: Predict
      let predictRes: Response;
      try {
        predictRes = await fetch(`${this.baseUrl}/predict`, {
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
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new ServiceUnavailableException(
          `Gagal menghubungi AI Engine untuk prediksi. Silakan pastikan python service berjalan. Detail: ${message}`,
        );
      }

      if (!predictRes.ok) {
        const errText = await predictRes.text();
        throw new BadRequestException(
          `VolumeMind Predict API Error: ${errText}`,
        );
      }

      const predictData = (await predictRes.json()) as PredictResult;

      // Step 2: Recommend
      let recommendRes: Response;
      try {
        recommendRes = await fetch(`${this.baseUrl}/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            predicted_demand_kg: predictData.predicted_demand_kg,
            suppliers: payload.suppliers,
            target_date: payload.target_date,
          }),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new ServiceUnavailableException(
          `Gagal menghubungi AI Engine untuk rekomendasi. Detail: ${message}`,
        );
      }

      if (!recommendRes.ok) {
        const errText = await recommendRes.text();
        throw new BadRequestException(
          `VolumeMind Recommend API Error: ${errText}`,
        );
      }

      const recommendData = (await recommendRes.json()) as RecommendResult;

      return {
        predicted_demand_kg: predictData.predicted_demand_kg,
        ...recommendData,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error in VolumemindService:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }
      throw new ServiceUnavailableException(
        `Layanan VolumeMind AI Engine tidak dapat merespon. Detail: ${message}`,
      );
    }
  }
}

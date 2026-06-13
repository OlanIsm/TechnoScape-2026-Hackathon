// volumemind.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { VolumemindService } from './volumemind.service';

interface RecommendationRequestDto {
  tanggal: string;
  id_koperasi: string;
  jenis_pupuk: string;
  curah_hujan_mm: number;
  musim_tanam: string;
  luas_lahan_hektar: number;
  suppliers: any[];
  target_date?: string;
}

@Controller('volumemind')
export class VolumemindController {
  constructor(private readonly volumemindService: VolumemindService) {}

  @Post('recommendation')
  async getRecommendation(@Body() body: RecommendationRequestDto) {
    console.log('body received:', body); // debug
    return this.volumemindService.getRecommendation(body);
  }
}

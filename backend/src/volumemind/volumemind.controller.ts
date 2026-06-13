import { Controller, Post, Body } from '@nestjs/common';
import { VolumemindService } from './volumemind.service';

@Controller('volumemind')
export class VolumemindController {
    constructor(private readonly volumemindService: VolumemindService) { }

    @Post('recommendation')
    async getRecommendation(@Body() body: any) {
        return this.volumemindService.getRecommendation(body);
    }
}
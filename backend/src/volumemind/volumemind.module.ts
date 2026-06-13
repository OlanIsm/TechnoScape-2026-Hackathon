import { Module } from '@nestjs/common';
import { VolumemindController } from './volumemind.controller';
import { VolumemindService } from './volumemind.service';

@Module({
  controllers: [VolumemindController],
  providers: [VolumemindService],
  exports: [VolumemindService],
})
export class VolumemindModule {}

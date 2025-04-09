import { Module } from '@nestjs/common';
import { ApproachesService } from './approaches.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ApproachesController } from './approaches.controller';

@Module({
  imports: [PrismaModule],
  providers: [ApproachesService],
  controllers: [ApproachesController],
  exports: [ApproachesService],
})
export class ApproachesModule {}

import { Module } from '@nestjs/common';
import { VideoCallService } from './videocall.service';
import { UsersModule } from 'src/users/users.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [UsersModule, PrismaModule],
  providers: [VideoCallService],
  exports: [VideoCallService],
})
export class VideoCallModule {}

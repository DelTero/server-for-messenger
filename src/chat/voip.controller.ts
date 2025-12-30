import { Controller, Get, UseGuards } from '@nestjs/common';
import { VoipService } from './voip.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('voip')
export class VoipController {
  constructor(private readonly voipService: VoipService) {}

  @Get('ice-servers')
  async getIceServers() {
    const iceServers = await this.voipService.getIceServers();

    console.log('iceServers controller', iceServers);
    return { iceServers };
  }
}

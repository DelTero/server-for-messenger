import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VoipService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async getIceServers() {
    const keyId = this.configService.get<string>('CLOUDFLARE_TURN_KEY_ID');
    const apiToken = this.configService.get<string>('CLOUDFLARE_TURN_API_TOKEN');
    const ttlRaw = this.configService.get<string>('CLOUDFLARE_TURN_TTL');
    const ttl = ttlRaw ? Number(ttlRaw) : 86400;

    if (!keyId || !apiToken) {
      throw new InternalServerErrorException('Cloudflare TURN configuration is missing');
    }

    const url = `https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(keyId)}/credentials/generate-ice-servers`;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          url,
          { ttl },
          {
            headers: {
              Authorization: `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return data.iceServers;
    } catch (error) {
      console.error('Failed to fetch ICE servers from Cloudflare:', error);
      throw new InternalServerErrorException('Could not fetch ICE servers');
    }
  }
}

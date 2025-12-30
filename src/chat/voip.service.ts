import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VoipService {
  constructor(private configService: ConfigService) {}

  async getIceServers() {
    const apiKey = this.configService.get<string>('METERED_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException('Metered API key is missing');
    }

    try {
      const response = await fetch(`https://mia.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`, {
        method: 'GET',
      });

      const iceServers = await response.json();
      return iceServers;
    } catch (error) {
      console.error('Failed to fetch ICE servers from Metered:', error);
      throw new InternalServerErrorException('Could not fetch ICE servers');
    }
  }
}

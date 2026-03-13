import { Controller, Get, Param, Patch, Req, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Sse('stream')
  stream(@Req() req: Request): Observable<MessageEvent> {
    const userId = (req as any).user.sub;
    const { connectionId, stream } = this.notificationsService.getStream(userId);

    req.on('close', () => {
      this.notificationsService.removeStream(userId, connectionId);
    });

    return stream;
  }

  @Get()
  getAll(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.notificationsService.getByUser(userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('read-all')
  markAllAsRead(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.notificationsService.markAllAsRead(userId);
  }
}

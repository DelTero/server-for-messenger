import { Controller, Get, Req } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Req() req: Request) {
    const currentUserId = (req as any).user.sub;
    return this.usersService.findAllExcept(currentUserId);
  }
}

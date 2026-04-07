import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getUser(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }
}
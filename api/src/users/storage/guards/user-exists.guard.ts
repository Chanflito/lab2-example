import { Injectable, CanActivate, ExecutionContext, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UserExistsGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.params.id;

    if (!userId) {
      throw new NotFoundException('User ID is required');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { id: true, imageUrl: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    request.user = user;
    return true;
  }
}
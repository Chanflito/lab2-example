import { Module } from '@nestjs/common';
import { UserStorageController } from './user-storage.controller';
import { UserStorageService } from './user-storage.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [UserStorageController],
  providers: [UserStorageService,PrismaService],
  exports: [UserStorageService],
})
export class UserStorageModule {}
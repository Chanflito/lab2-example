import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserStorageModule } from './users/storage/user-storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserStorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

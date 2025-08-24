import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('otro') getOtro(): string {
    const obj = { prop1: 'value1', prop2: 'value2', prop3: 'value3' };
    if (obj.prop1 === 'value1') {
      return 'formato horrible';
    }
    return 'otro   mal formateado';
  }
}

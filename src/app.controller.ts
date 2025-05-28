import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { EncryptDataDto } from './dto/encrypt-data.dto';
import { DecryptDataDto } from './dto/decrypt-data.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('get-encrypt-data')
  async getEncryptData(@Body() encryptDataDto: EncryptDataDto) {
    return await this.appService.encryptData(encryptDataDto.payload);
  }

  @Post('get-decrypt-data')
  getDecryptData(@Body() decryptDataDto: DecryptDataDto) {
    return this.appService.decryptData(
      decryptDataDto.data1,
      decryptDataDto.data2,
    );
  }
}

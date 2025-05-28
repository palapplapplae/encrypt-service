import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DecryptDataDto {
  @ApiProperty({ description: 'First part of encrypted data' })
  @IsString()
  data1: string;

  @ApiProperty({ description: 'Second part of encrypted data' })
  @IsString()
  data2: string;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class EncryptDataDto {
  @ApiProperty({ description: 'Data to be encrypted', maxLength: 2000 })
  @IsString()
  @MaxLength(2000)
  payload: string;
}

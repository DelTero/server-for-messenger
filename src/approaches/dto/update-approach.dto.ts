import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateApproachDto {
  @ApiProperty({
    description: 'Количество повторений',
    example: 12,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  reps?: number;

  @ApiProperty({
    description: 'Вес в килограммах',
    example: 60.5,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;
}

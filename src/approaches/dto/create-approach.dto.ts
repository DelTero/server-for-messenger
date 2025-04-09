import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApproachDto {
  @ApiProperty({
    description: 'Количество повторений',
    example: 12,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  reps!: number;

  @ApiProperty({
    description: 'Вес в килограммах',
    example: 60.5,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  weight!: number;

  @ApiProperty({
    description: 'ID упражнения',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsString()
  exerciseId!: string;

  @ApiProperty({
    description: 'ID пользователя',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId!: number;
}

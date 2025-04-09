import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateExerciseDto {
  @ApiProperty({
    description: 'Новое название упражнения',
    example: 'Жим лежа со штангой',
  })
  @IsString()
  name!: string;
}

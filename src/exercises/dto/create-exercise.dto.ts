import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExerciseDto {
  @ApiProperty({
    description: 'Название упражнения',
    example: 'Жим лежа',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'ID пользователя, создавшего упражнение',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId!: number;
}

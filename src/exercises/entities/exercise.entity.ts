import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsDate } from 'class-validator';

export class ExerciseEntity {
  @ApiProperty({
    description: 'Уникальный идентификатор упражнения',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  id!: string;

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

  @ApiProperty({
    description: 'Дата создания упражнения',
    example: '2023-05-15T14:30:00Z',
  })
  @IsDate()
  createdAt!: Date;
}

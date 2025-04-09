import { ApiProperty } from '@nestjs/swagger';

export class ApproachEntity {
  @ApiProperty({
    description: 'Уникальный идентификатор подхода',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Количество повторений',
    example: 12,
  })
  reps!: number;

  @ApiProperty({
    description: 'Вес в килограммах',
    example: 60.5,
  })
  weight!: number;

  @ApiProperty({
    description: 'ID упражнения',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  exerciseId!: string;

  @ApiProperty({
    description: 'ID пользователя',
    example: 1,
  })
  userId!: number;

  @ApiProperty({
    description: 'Дата выполнения подхода',
    example: '2023-05-15T14:30:00Z',
  })
  date!: Date;
}

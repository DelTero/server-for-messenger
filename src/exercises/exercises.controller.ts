import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ApiOkResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { ExerciseEntity } from './entities/exercise.entity';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseFilters } from './interfaces/exercise-filters.interface';

@Controller('fitness/exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  @ApiOkResponse({
    description: 'Список упражнений',
    type: [ExerciseEntity],
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'ID пользователя для фильтрации упражнений',
    example: '1',
  })
  async findExercises(@Query('userId') userId?: string) {
    const filters: ExerciseFilters = {};

    if (userId) {
      filters.userId = parseInt(userId);
    }

    return this.exercisesService.findExercises(filters);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'ID упражнения',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    type: ExerciseEntity,
  })
  async findById(@Param('id') id: string) {
    return this.exercisesService.findById(id);
  }

  @HttpCode(HttpStatus.OK)
  @Post()
  @ApiOkResponse({
    description: 'Упражнение успешно создано',
    type: ExerciseEntity,
  })
  async create(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.createExercise(createExerciseDto);
  }

  @Put(':id')
  @ApiParam({
    name: 'id',
    description: 'ID упражнения',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Упражнение успешно обновлено',
    type: ExerciseEntity,
  })
  async update(@Param('id') id: string, @Body() updateExerciseDto: UpdateExerciseDto) {
    return this.exercisesService.updateExercise(id, updateExerciseDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'ID упражнения',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Упражнение успешно удалено',
    type: ExerciseEntity,
  })
  async delete(@Param('id') id: string) {
    return this.exercisesService.deleteExercise(id);
  }
}

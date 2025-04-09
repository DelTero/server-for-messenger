import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ApproachesService } from './approaches.service';
import { ApiOkResponse, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateApproachDto } from './dto/create-approach.dto';
import { ApproachEntity } from './entities/approach.entity';
import { UpdateApproachDto } from './dto/update-approach.dto';
import { ApproachFilters } from './interfaces/approach-filters.interface';

@Controller('fitness/approaches')
export class ApproachesController {
  constructor(private readonly approachesService: ApproachesService) {}

  @Get()
  @ApiOkResponse({
    description: 'Список подходов',
    type: [ApproachEntity],
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'ID пользователя для фильтрации подходов',
    example: '1',
  })
  @ApiQuery({
    name: 'exerciseId',
    required: false,
    description: 'ID упражнения для фильтрации подходов',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  async findApproaches(@Query('userId') userId?: string, @Query('exerciseId') exerciseId?: string) {
    const filters: ApproachFilters = {};

    if (userId) {
      filters.userId = parseInt(userId);
    }

    if (exerciseId) {
      filters.exerciseId = exerciseId;
    }

    return this.approachesService.findApproaches(filters);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'ID подхода',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Подход найден',
    type: ApproachEntity,
  })
  async findById(@Param('id') id: string) {
    return this.approachesService.findById(id);
  }

  @Post()
  @ApiOkResponse({
    description: 'Подход успешно создан',
    type: ApproachEntity,
  })
  async create(@Body() createApproachDto: CreateApproachDto) {
    return this.approachesService.createApproach(createApproachDto);
  }

  @Put(':id')
  @ApiParam({
    name: 'id',
    description: 'ID подхода',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Подход успешно обновлен',
    type: ApproachEntity,
  })
  async update(@Param('id') id: string, @Body() updateApproachDto: UpdateApproachDto) {
    return this.approachesService.updateApproach(id, updateApproachDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'ID подхода',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Подход успешно удален',
    type: ApproachEntity,
  })
  async delete(@Param('id') id: string) {
    return this.approachesService.deleteApproach(id);
  }
}

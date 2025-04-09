import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApproachEntity } from './entities/approach.entity';
import { ApproachFilters } from './interfaces/approach-filters.interface';

const approachSelect = {
  id: true,
  reps: true,
  weight: true,
  exerciseId: true,
  userId: true,
  date: true,
} satisfies Prisma.ApproachSelect;

@Injectable()
export class ApproachesService {
  constructor(private prisma: PrismaService) {}

  async findApproaches(filters?: ApproachFilters): Promise<ApproachEntity[]> {
    try {
      const approaches = await this.prisma.approach.findMany({
        where: filters || {},
        select: approachSelect,
      });

      return approaches;
    } catch (error) {
      throw new Error('Ошибка при получении списка подходов');
    }
  }

  async findById(id: string): Promise<ApproachEntity | null> {
    try {
      const approach = await this.prisma.approach.findUnique({
        where: { id },
        select: approachSelect,
      });

      if (!approach) {
        throw new NotFoundException('Подход с таким id не найден');
      }

      return approach;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Ошибка при поиске подхода');
    }
  }

  async createApproach(data: {
    reps: number;
    weight: number;
    exerciseId: string;
    userId: number;
  }): Promise<ApproachEntity> {
    try {
      const approach = await this.prisma.approach.create({
        data: {
          reps: data.reps,
          weight: data.weight,
          exerciseId: data.exerciseId,
          userId: data.userId,
        },
        select: approachSelect,
      });
      return approach;
    } catch (error) {
      throw new Error('Ошибка при создании подхода');
    }
  }

  async updateApproach(id: string, data: { reps?: number; weight?: number }): Promise<ApproachEntity> {
    try {
      const approach = await this.prisma.approach.findUnique({
        where: { id },
      });

      if (!approach) {
        throw new NotFoundException('Подход с таким id не найден');
      }

      const updatedApproach = await this.prisma.approach.update({
        where: { id },
        data: {
          reps: data.reps !== undefined ? data.reps : approach.reps,
          weight: data.weight !== undefined ? data.weight : approach.weight,
        },
        select: approachSelect,
      });

      return updatedApproach;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Ошибка при обновлении подхода');
    }
  }

  async deleteApproach(id: string): Promise<ApproachEntity> {
    try {
      const approach = await this.prisma.approach.findUnique({
        where: { id },
      });

      if (!approach) {
        throw new NotFoundException('Подход с таким id не найден');
      }

      const deletedApproach = await this.prisma.approach.delete({
        where: { id },
        select: approachSelect,
      });

      return deletedApproach;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Ошибка при удалении подхода');
    }
  }
}

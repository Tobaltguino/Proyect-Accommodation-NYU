import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanAlimenticioEntity } from '../solicitudes/entities';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
@Injectable()
export class PlanAlimenticioService {
  constructor(
    @InjectRepository(PlanAlimenticioEntity)
    private readonly planAlimenticioRepo: Repository<PlanAlimenticioEntity>,
  ) {}
  async obtenerTodas() {
    return await this.planAlimenticioRepo.find({});
  }
}

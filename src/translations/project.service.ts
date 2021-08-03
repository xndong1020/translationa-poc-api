import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async getAll() {
    return await this.projectRepository.find({});
  }

  async getById(id: number): Promise<Project> {
    return await this.projectRepository.findOneOrFail({ id });
  }
}

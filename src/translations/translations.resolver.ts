import { Resolver, Query, Args } from '@nestjs/graphql';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';
import { ConfigService } from '@nestjs/config';
import { Language } from './entities/language.entity';
import { TaskService } from './task.service';
import { GetAllTranslationResponse } from './dtos/GetAllTranslationResponse';

@Resolver()
export class TranslationsResolver {
  constructor(
    private readonly projectService: ProjectService,
    private readonly taskService: TaskService,
    private readonly configService: ConfigService,
  ) {}

  @Query(() => [Project], { nullable: true })
  async getProjects(): Promise<Project[]> {
    return await this.projectService.getAll();
  }

  @Query(() => Project, { nullable: true })
  async findProjectById(@Args('id') id: number): Promise<Project> {
    return await this.projectService.getById(id);
  }

  @Query(() => [GetAllTranslationResponse], { nullable: true })
  async getAllTranslations(): Promise<GetAllTranslationResponse[]> {
    return await this.taskService.getAllTranslation();
  }
}

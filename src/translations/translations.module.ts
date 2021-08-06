import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';
import { TranslationsResolver } from './translations.resolver';
import { Translation } from './entities/translation.entity';
import { Task } from './entities/task.entity';
import { TaskService } from './task.service';
import { TasksResolver } from './tasks.resolver';
import { User } from 'src/users/entities/user.entity';
import { Language } from './entities/language.entity';
import { Assignee } from './entities/assignee.entity';
import { TranslationSearchService } from 'src/translation-search/translation-search.service';
import { TranslationSearchModule } from 'src/translation-search/translation-search.module';

@Module({
  imports: [
    TranslationSearchModule,
    TypeOrmModule.forFeature([
      Project,
      Translation,
      Task,
      User,
      Language,
      Assignee,
    ]),
  ],
  providers: [
    TranslationsResolver,
    TasksResolver,
    ProjectService,
    TaskService,
    TranslationSearchService,
  ],
})
export class TranslationsModule {}

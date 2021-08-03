import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import uniq from 'lodash/uniq';
import { User } from 'src/users/entities/user.entity';
import { Connection, Repository } from 'typeorm';
import { CreateNewTaskInput } from './dtos/CreateNewTaskInput.dto';
import { CreateTaskInput } from './dtos/CreateTaskInput.dto';
import { GetTranslationLanguageInput } from './dtos/GetTranslationLanguageInput.dto';
import { TranslationTaskResponse } from './dtos/TranslationTaskResponse';
import { UpdateTranslationLanguageInput } from './dtos/updateTranslationLanguageInput.dto';
import { Assignee } from './entities/assignee.entity';
import { Language } from './entities/language.entity';
import { Task } from './entities/task.entity';
import { Translation } from './entities/translation.entity';

export type QueryResult = [boolean, string?];

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Translation)
    private readonly translationRepository: Repository<Translation>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
    @InjectRepository(Assignee)
    private readonly assigneeRepository: Repository<Assignee>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly connection: Connection,
  ) {}

  async getAll() {
    return await this.taskRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async getMyTaskLanguage(taskId: number, user: User) {
    const assignedToMe = await this.assigneeRepository
      .createQueryBuilder('a')
      .select(['a.assignedLanguage'])
      .leftJoin('a.task', 't')
      .leftJoin('a.user', 'u')
      .addSelect('u.id')
      .where('t.id = :taskId', { taskId })
      .andWhere('u.id  = :userId', { userId: user.id })
      .getOne();

    return assignedToMe.assignedLanguage;
  }

  async getMyTasks(user: User) {
    const assignedToMe = await this.assigneeRepository.find({
      where: { user },
      relations: ['task'],
    });
    if (!assignedToMe.length) return [];
    const ids: number[] = uniq(
      assignedToMe.map((assignee) => assignee.task.id),
    );
    const allMyTasks = await this.taskRepository
      .createQueryBuilder('t')
      .where('t.id IN (:...ids)', {
        ids,
      })
      .orderBy('t.id')
      .getMany();
    return allMyTasks;
  }

  async getTranslationTasks(
    input: GetTranslationLanguageInput,
    user: User,
  ): Promise<TranslationTaskResponse[]> {
    const assignedLanguage = await this.assigneeRepository
      .createQueryBuilder('a')
      .select('a.assignedLanguage')
      .leftJoin('a.task', 't')
      .where('t.id = :taskId', { taskId: input.taskId })
      .andWhere('a.userId = :userId', { userId: user.id })
      .orderBy('a.id')
      .getOne();

    let baseQuery = this.languageRepository
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.translation', 'tr');

    if (input.myTaskLanguage) {
      baseQuery = baseQuery.addSelect(`l.${input.myTaskLanguage}`);
    }

    baseQuery = baseQuery
      .leftJoinAndSelect('tr.task', 't')
      .where('t.id = :taskId', { taskId: input.taskId })
      .orderBy('l.id');

    const languages = await baseQuery.getMany();

    const results: TranslationTaskResponse[] = languages.map((l) => {
      return {
        languageId: l.id,
        keyName: l.translation.keyName,
        en: l.en,
        assignedLanguageName: assignedLanguage.assignedLanguage,
        assignedLanguageValue: l[input.myTaskLanguage],
      };
    });

    return results;
  }

  async getAllTranslation() {
    const allTranslation = await this.languageRepository.find({
      relations: ['translation'],
      order: {
        id: 'ASC',
      },
    });

    const mapped = allTranslation.map((t) => {
      return {
        key: t.translation.keyName,
        en: t.en,
        fr: t.fr,
        zh: t.zh,
        ar: t.ar,
        pt: t.pt,
        es: t.es,
        ko: t.ko,
      };
    });

    return mapped;
  }

  async updateTranslationLanguage(
    updateTranslationLanguageInput: UpdateTranslationLanguageInput,
  ): Promise<QueryResult> {
    try {
      const langInDb = await this.languageRepository.findOneOrFail({
        id: updateTranslationLanguageInput.id,
      });

      Object.keys(updateTranslationLanguageInput).forEach((key) => {
        langInDb[key] = updateTranslationLanguageInput[key];
      });

      await this.languageRepository.save(langInDb);
      return [true];
    } catch (e) {
      return [false, e.message];
    }
  }

  async create(task: CreateTaskInput): Promise<number> {
    const newTask = await this.taskRepository.create(task);
    const newTaskId = await this.taskRepository.save(newTask);
    return newTaskId.id;
  }

  async createNewTask(newTask: CreateNewTaskInput): Promise<QueryResult> {
    const allLanguages = ['fr', 'zh', 'pt', 'es', 'ar', 'ko'];

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const task = new Task();
      task.name = newTask.taskName;
      task.isComplete = false;

      const newTaskInDb = await queryRunner.manager.save<Task>(task);

      for await (const translationKey of newTask.translationItems) {
        const translation = new Translation();
        translation.keyName = translationKey.keyName;
        translation.task = newTaskInDb;
        await queryRunner.manager.save<Translation>(translation);

        const language = new Language();
        language.en = translationKey.keyValue;
        language.translation = translation;

        for (const lan of allLanguages) {
          language[lan] = '';
        }

        await queryRunner.manager.save<Language>(language);
      }

      for await (const assignee of newTask.assignees) {
        const userInDb = await this.userRepository.findOneOrFail({
          email: assignee.email,
        });
        const newAssignee = new Assignee();
        newAssignee.user = userInDb;
        newAssignee.assignedLanguage = assignee.language;
        newAssignee.task = newTaskInDb;
        await queryRunner.manager.save<Assignee>(newAssignee);
      }
      await queryRunner.commitTransaction();
      return [true];
    } catch (e) {
      console.log('error', e);
      await queryRunner.rollbackTransaction();
      return [false, e.message];
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}

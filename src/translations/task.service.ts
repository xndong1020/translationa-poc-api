import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
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
import {
  ITranslateProps,
  TranslationSearchService,
} from 'src/translation-search/translation-search.service';
import { SUPPORTED_LANGUAGES } from 'src/common/constants/constants';
import { AutoTranslateService } from 'src/auto-translate/auto-translate.service';
import { KafkaService } from 'src/kafka/kafka.service';
import { KafkaPayload } from 'src/kafka/kafka.config';
import { TaskStatus } from 'src/common/enums/TASK_STATUS.enum';

export type QueryResult = [boolean, string?, any?];

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
    private translationSearchService: TranslationSearchService,
    private autoTranslateService: AutoTranslateService,
    private readonly kafkaService: KafkaService,
    private readonly connection: Connection,
    @InjectSentry() private readonly logger: SentryService,
  ) {}

  async getAll() {
    try {
      return await this.taskRepository
        .createQueryBuilder('t')
        .leftJoinAndSelect('t.translationItems', 'tt')
        .leftJoinAndSelect('tt.language', 'ttl')
        .orderBy('t.id', 'ASC')
        .getMany();
    } catch (e) {
      console.log('error', e);
      // this.logger.instance().captureMessage(message, Sentry.Severity.Log);
      this.logger.instance().captureException(e);
      throw e;
    }
  }

  async getMyTaskLanguage(taskId: number, user: User) {
    try {
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
    } catch (e) {
      console.log('error', e);
      // this.logger.instance().captureMessage(message, Sentry.Severity.Log);
      this.logger.instance().captureException(e);
      throw e;
    }
  }

  async getMyTasks(user: User) {
    try {
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
        .leftJoinAndSelect('t.translationItems', 'tt')
        .leftJoinAndSelect('tt.language', 'ttl')
        .where('t.id IN (:...ids)', {
          ids,
        })
        .orderBy('t.id')
        .getMany();
      return allMyTasks;
    } catch (e) {
      console.log('error', e);
      // this.logger.instance().captureMessage(message, Sentry.Severity.Log);
      this.logger.instance().captureException(e);
      throw e;
    }
  }

  async getTranslationTasks(
    input: GetTranslationLanguageInput,
    user: User,
  ): Promise<TranslationTaskResponse[]> {
    try {
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
    } catch (e) {
      console.log('error', e);
      // this.logger.instance().captureMessage(message, Sentry.Severity.Log);
      this.logger.instance().captureException(e);
      throw e;
    }
  }

  async getAllTranslation() {
    try {
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
    } catch (e) {
      console.log('error', e);
      // this.logger.instance().captureMessage(message, Sentry.Severity.Log);
      this.logger.instance().captureException(e);
      throw e;
    }
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
      console.log('error', e);
      // this.logger.instance().captureMessage(message, Sentry.Severity.Log);
      this.logger.instance().captureException(e);
      return [false, e.message];
    }
  }

  async create(task: CreateTaskInput): Promise<number> {
    const newTask = await this.taskRepository.create(task);
    const newTaskId = await this.taskRepository.save(newTask);
    return newTaskId.id;
  }

  async createNewTask(
    newTask: CreateNewTaskInput,
    user: User,
  ): Promise<QueryResult> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const task = new Task();
      task.name = newTask.taskName;
      task.status = TaskStatus.Pending;
      task.updatedBy = user.email || '';

      const newTaskInDb = await queryRunner.manager.save<Task>(task);

      for await (const translationKey of newTask.translationItems) {
        const translation = new Translation();
        translation.keyName = translationKey.keyName;
        translation.task = newTaskInDb;
        await queryRunner.manager.save<Translation>(translation);

        const language = new Language();
        language.en = translationKey.keyValue;
        language.translation = translation;

        // const autoTranslations =
        //   await this.autoTranslateService.translateTextBulk(
        //     translationKey.keyValue,
        //   );
        // for (const lan of SUPPORTED_LANGUAGES) {
        //   language[lan] = autoTranslations[lan] || '';
        // }

        for (const lan of SUPPORTED_LANGUAGES) {
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

      const taskSaved = await this.findTaskById(newTaskInDb.id);
      const data = taskSaved.translationItems.map((item) => ({
        id: item.language.id,
        taskName: newTask.taskName,
        keyName: item.keyName,
        description: item.language.en,
      }));

      const payload: KafkaPayload = {
        messageId: '' + new Date().valueOf(),
        body: {
          value: data,
        },
        messageType: 'Translation.Released',
        topicName: 'translation.creation.topic',
      };
      const value = await this.kafkaService.sendMessage(
        'translation.creation.topic',
        payload,
      );
      console.log('kafka status ', value);
      return [true, null, newTaskInDb];
    } catch (e) {
      console.log('error', e);
      await queryRunner.rollbackTransaction();
      // this.logger.instance().captureMessage(message, Sentry.Severity.Log);
      this.logger.instance().captureException(e);
      return [false, e.message, null];
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  async findTaskById(id: number): Promise<Task> {
    return await this.taskRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.translationItems', 'tt')
      .leftJoinAndSelect('tt.language', 'ttl')
      .where('t.id = :taskId', {
        taskId: id,
      })
      .orderBy('t.id')
      .getOne();
  }

  async proofreadTask(id: number, user: User): Promise<QueryResult> {
    try {
      const taskInDb = await this.taskRepository.findOneOrFail({
        id,
      });

      if (taskInDb.status === TaskStatus.Locked)
        throw new Error('Task is currently locked.');

      taskInDb.status = TaskStatus.Proofreaded;
      taskInDb.updatedBy = user.email || 'Translator';
      await this.taskRepository.save(taskInDb);

      return [true];
    } catch (e) {
      console.log('error', e);
      // this.logger.instance().captureMessage(message, Sentry.Severity.Log);
      this.logger.instance().captureException(e);
      return [false, e.message];
    }
  }

  async releaseTask(id: number, user: User): Promise<QueryResult> {
    try {
      const taskInDb = await this.taskRepository.findOneOrFail({
        id,
      });

      // if (taskInDb.status !== TaskStatus.Proofreaded)
      //   throw new Error('Task has to been proofreaded by translator first.');

      taskInDb.status = TaskStatus.Released;
      taskInDb.updatedBy = user.email || 'Admin';
      await this.taskRepository.save(taskInDb);

      const currentTaskWithTranslation = await this.findTaskById(id);

      const data: ITranslateProps[] =
        currentTaskWithTranslation.translationItems.map((item) => {
          return {
            projectName: currentTaskWithTranslation.name,
            keyName: item.keyName,
            description: item.language.en,
            translation: {
              en: item.language.en,
              fr: item.language.fr,
              zh: item.language.zh,
              es: item.language.es,
              pt: item.language.pt,
              ko: item.language.ko,
              ar: item.language.ar,
            },
          };
        });

      const payload: KafkaPayload = {
        messageId: '' + new Date().valueOf(),
        body: {
          value: data,
        },
        messageType: 'Translation.Released',
        topicName: 'translation.upsert.topic',
      };
      const value = await this.kafkaService.sendMessage(
        'translation.upsert.topic',
        payload,
      );
      console.log('kafka status ', value);

      return [true];
    } catch (e) {
      console.log('error', e);
      // this.logger.instance().captureMessage(message, Sentry.Severity.Log);
      this.logger.instance().captureException(e);
      return [false, e.message];
    }
  }

  async toggleLockTask(id: number, user: User): Promise<QueryResult> {
    try {
      const taskInDb = await this.taskRepository.findOneOrFail({
        id,
      });

      if ([TaskStatus.Released].includes(taskInDb.status)) {
        throw new Error(
          'This task cannot be locked because it has been released',
        );
      }

      taskInDb.status =
        taskInDb.status === TaskStatus.Locked
          ? TaskStatus.Pending
          : TaskStatus.Locked;
      taskInDb.updatedBy = user.email || 'Admin';
      await this.taskRepository.save(taskInDb);

      return [true];
    } catch (e) {
      console.log('eee', e);
      // this.logger.instance().captureMessage(message, Sentry.Severity.Log);
      this.logger.instance().captureException(e);
      return [false, e.message];
    }
  }
}

import {
  Resolver,
  Query,
  Args,
  Int,
  Mutation,
  Context,
  Subscription,
} from '@nestjs/graphql';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';
import { ConfigService } from '@nestjs/config';
import { TaskService } from './task.service';
import { Task } from './entities/task.entity';
import { CreateTaskInput } from './dtos/CreateTaskInput.dto';
import { CreateNewTaskInput } from './dtos/CreateNewTaskInput.dto';
import { CreateNewTaskResponse } from './dtos/CreateNewTaskResponse';
import { Inject, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/common/enums/USER_ROLE.enum';
import { TranslationTaskResponse } from './dtos/TranslationTaskResponse';
import { UpdateTranslationLanguageInput } from './dtos/updateTranslationLanguageInput.dto';
import { UpdateTranslationLanguageResponse } from './dtos/UpdateTranslationLanguageResponse';
import { GetTranslationLanguageInput } from './dtos/GetTranslationLanguageInput.dto';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { SERVER_EVENT } from 'src/common/constants/constants';
import { LockTaskResponse } from './dtos/LockTaskResponse';

@Resolver()
export class TasksResolver {
  constructor(
    private readonly taskService: TaskService,
    private readonly configService: ConfigService,
    @Inject(PUB_SUB) private pubSub: RedisPubSub,
  ) {}

  @Query(() => [Task], { nullable: true })
  @UseGuards(AuthGuard)
  async getTasks(@Context() context: any): Promise<Task[]> {
    const user: User = context.user;
    if (user.role === UserRole.Translator)
      return await this.taskService.getMyTasks(user);

    return await this.taskService.getAll();
  }

  @Query(() => String, { nullable: true })
  @UseGuards(AuthGuard)
  async getMyTaskLanguage(
    @Args('taskId') taskId: number,
    @Context() context: any,
  ): Promise<string> {
    const user: User = context.user;
    return await this.taskService.getMyTaskLanguage(taskId, user);
  }

  @Query(() => [TranslationTaskResponse], { nullable: true })
  @UseGuards(AuthGuard)
  async getTranslationLanguage(
    @Args('input')
    input: GetTranslationLanguageInput,
    @Context() context: any,
  ): Promise<TranslationTaskResponse[]> {
    const user: User = context.user;
    const tasks = await this.taskService.getTranslationTasks(input, user);
    return tasks;
  }

  @Mutation(() => Int, { nullable: true })
  async createTask(
    @Args('createTaskDto') createTaskDto: CreateTaskInput,
  ): Promise<number> {
    return await this.taskService.create(createTaskDto);
  }

  @Mutation(() => CreateNewTaskResponse)
  async createNewTask(
    @Args('createNewTaskDto') createNewTaskDto: CreateNewTaskInput,
  ): Promise<CreateNewTaskResponse> {
    const [ok, error, newTaskCreated] = await this.taskService.createNewTask(
      createNewTaskDto,
    );
    if (ok && newTaskCreated) {
      this.pubSub.publish(SERVER_EVENT, {
        messageFeed: {
          functionName: 'createNewTask',
          payload: JSON.stringify(newTaskCreated),
        },
      });
    }
    return { ok, error };
  }

  @Mutation(() => UpdateTranslationLanguageResponse)
  async updateTranslationLanguage(
    @Args('updateTranslationLanguageInput')
    updateTranslationLanguageInput: UpdateTranslationLanguageInput,
  ): Promise<UpdateTranslationLanguageResponse> {
    const [ok, error] = await this.taskService.updateTranslationLanguage(
      updateTranslationLanguageInput,
    );
    return { ok, error };
  }

  @Mutation(() => LockTaskResponse)
  async lockTask(
    @Args('taskId') taskId: number,
    @Context() context: any,
  ): Promise<LockTaskResponse> {
    const user: User = context.user;
    if (user.role !== UserRole.Translator) {
      const [ok, error] = await this.taskService.lockTask(taskId, user.email);

      if (ok) {
        this.pubSub.publish(SERVER_EVENT, {
          messageFeed: {
            functionName: 'lockTask',
            payload: JSON.stringify({ taskId }),
          },
        });
      }

      return { ok, error };
    }
  }
}

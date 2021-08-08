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
import { ActionTaskResponse } from './dtos/ActionTaskResponse';
import { ActionTaskInput } from './dtos/ActionTaskInput.dto';
import { TaskActions } from 'src/common/enums/TASK_ACTIONS.enum';

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
    @Context() context: any,
  ): Promise<CreateNewTaskResponse> {
    const user: User = context.user;
    const [ok, error, newTaskCreated] = await this.taskService.createNewTask(
      createNewTaskDto,
      user,
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

  @Mutation(() => ActionTaskResponse)
  async actionOnTask(
    @Args('actionTaskInput') actionTaskInput: ActionTaskInput,
    @Context() context: any,
  ): Promise<ActionTaskResponse> {
    const user: User = context.user;

    if (actionTaskInput.action === TaskActions.ToggleLock) {
      if (user.role === UserRole.Translator)
        return {
          ok: false,
          error: `You don't have permission to lock task`,
        };

      const [ok, error] = await this.taskService.toggleLockTask(
        actionTaskInput.taskId,
        user,
      );

      if (ok) {
        this.pubSub.publish(SERVER_EVENT, {
          messageFeed: {
            functionName: `${TaskActions.ToggleLock}Task`,
            payload: JSON.stringify({ taskId: actionTaskInput.taskId }),
          },
        });
      }

      return { ok, error };
    }

    if (actionTaskInput.action === TaskActions.Proofread) {
      if (user.role !== UserRole.Translator)
        return {
          ok: false,
          error: `You don't have permission to proofread task`,
        };

      const [ok, error] = await this.taskService.proofreadTask(
        actionTaskInput.taskId,
        user,
      );

      if (ok) {
        this.pubSub.publish(SERVER_EVENT, {
          messageFeed: {
            functionName: `${TaskActions.Proofread}Task`,
            payload: JSON.stringify({ taskId: actionTaskInput.taskId }),
          },
        });
      }

      return { ok, error };
    }

    if (actionTaskInput.action === TaskActions.Release) {
      if (user.role === UserRole.Translator)
        return {
          ok: false,
          error: `You don't have permission to release task`,
        };

      const [ok, error] = await this.taskService.releaseTask(
        actionTaskInput.taskId,
        user,
      );

      if (ok) {
        this.pubSub.publish(SERVER_EVENT, {
          messageFeed: {
            functionName: `${TaskActions.Release}Task`,
            payload: JSON.stringify({ taskId: actionTaskInput.taskId }),
          },
        });
      }

      return { ok, error };
    }
  }
}

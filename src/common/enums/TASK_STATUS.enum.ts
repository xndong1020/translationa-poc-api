import { registerEnumType } from '@nestjs/graphql';

export enum TaskStatus {
  Pending = 'pending',
  Locked = 'locked',
  Proofreaded = 'proofreaded',
  Released = 'released',
}

registerEnumType(TaskStatus, { name: 'TaskStatus' });

import { registerEnumType } from '@nestjs/graphql';

export enum TaskActions {
  Create = 'create',
  ToggleLock = 'toggleLock',
  Proofread = 'proofread',
  Release = 'Release',
}

registerEnumType(TaskActions, { name: 'TaskActions' });

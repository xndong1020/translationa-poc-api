import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  Owner = 'owner',
  Admin = 'admin',
  Translator = 'translator',
}

registerEnumType(UserRole, { name: 'UserRole' });

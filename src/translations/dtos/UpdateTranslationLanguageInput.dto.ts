import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { Language } from '../entities/language.entity';

@InputType()
export class UpdateTranslationLanguageInput extends PartialType(
  OmitType(Language, ['updatedAt', 'createdAt', 'translation'] as const),
) {}

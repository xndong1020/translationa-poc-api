import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

@InputType({ isAbstract: true })
@ObjectType()
@Entity({ name: 'projects' })
export class Project extends CoreEntity {
  @Column()
  @Field()
  name: string;
}

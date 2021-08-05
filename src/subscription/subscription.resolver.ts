import { Inject } from '@nestjs/common';
import { Resolver, Subscription } from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { SERVER_EVENT } from 'src/common/constants/constants';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { ServerMessage } from './dtos/ServerMessage.dto';

@Resolver()
export class SubscriptionResolver {
  constructor(@Inject(PUB_SUB) private pubSub: RedisPubSub) {}

  @Subscription(() => ServerMessage, { nullable: true })
  messageFeed() {
    return this.pubSub.asyncIterator(SERVER_EVENT);
  }
}

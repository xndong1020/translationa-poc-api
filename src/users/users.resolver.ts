import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';

import { AuthGuard } from 'src/auth/auth.guard';
import { EnvGuard } from 'src/common/env.guard';
import { LoginUserDto } from './dtos/login-user.dto';
import { LoginUserResponse } from './dtos/login-user.response';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { NODE_ENV } from 'src/common/enums/NODE_ENV.enum';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { UserRole } from 'src/common/enums/USER_ROLE.enum';
import { CreateUserDto } from './dtos/create-user.dto';
import { CreateUserResponse } from './dtos/create-user.response';

@Resolver((of) => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Query((returns) => [User])
  async getUsers(): Promise<User[]> {
    return await this.usersService.getAll();
  }

  @Query((returns) => User)
  @UseGuards(AuthGuard)
  async me(@AuthUser() authUser: User): Promise<User> {
    return authUser;
  }

  @Mutation((returns) => CreateUserResponse)
  async createUser(
    @Args('newUser') newUser: CreateUserDto,
  ): Promise<CreateUserResponse> {
    const [ok, error] = await this.usersService.createUser(newUser);
    return { ok, error };
  }

  @Mutation((returns) => LoginUserResponse)
  async loginUser(
    @Args('loginUser') loginUser: LoginUserDto,
  ): Promise<LoginUserResponse> {
    const [ok, error, token] = await this.usersService.loginUser(loginUser);
    return { ok, error, token };
  }
}

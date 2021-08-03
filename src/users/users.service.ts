import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { LoginUserDto } from './dtos/login-user.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { SearchUserFilters } from './interfaces/search-user-filters.interface';
import { PasswordHelper } from 'src/common/utils/PasswordHelper';
import { CreateUserDto } from './dtos/create-user.dto';

type QueryResult = [boolean, string?];

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly connection: Connection,
    private readonly jwtService: JwtService,
  ) {}

  async getAll(): Promise<User[]> {
    return this.usersRepository.find({});
  }

  async getOne(filters: SearchUserFilters): Promise<User> {
    return this.usersRepository.findOneOrFail({ ...filters });
  }

  async createUser(newUserDto: CreateUserDto): Promise<QueryResult> {
    try {
      const userInDb = await this.usersRepository.findOne({
        email: newUserDto.email,
      });

      if (userInDb) throw new Error('Email already registered');

      const newUser = this.usersRepository.create(newUserDto);
      await this.usersRepository.save(newUser);

      return [true];
    } catch (e) {
      return [false, e.message];
    }
  }

  async loginUser({
    email,
    password,
  }: LoginUserDto): Promise<[boolean, string?, string?]> {
    try {
      const userInDb = await this.usersRepository.findOneOrFail({ email });

      const isPasswordMatch = await PasswordHelper.validatePassword(
        password,
        userInDb.password,
      );
      if (!isPasswordMatch) throw new Error('Invalid email/password');

      return [true, null, await this.jwtService.sign({ id: userInDb.id })];
    } catch (e) {
      return [false, e.message];
    }
  }
}

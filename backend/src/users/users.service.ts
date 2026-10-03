import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { NullableType } from '../utils/types/nullable.type';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, Status, User } from './domain/user';
import { UserRepository } from './infrastructure/persistence/user.repository';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    let hashedPassword = createUserDto.password;
    if (createUserDto.password) {
      hashedPassword = await argon2.hash(createUserDto.password, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
      });
    }

    return this.userRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      role: createUserDto.role || Role.USER,
      status: createUserDto.status || Status.ACTIVE,
    });
  }

  async findManyWithPagination(query: QueryUserDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const { data, total } = await this.userRepository.findManyWithPagination({
      page,
      limit,
      search: query.search,
      role: query.role,
      status: query.status,
    });

    return {
      data,
      total,
      page,
      limit,
      hasNextPage: page * limit < total,
    };
  }

  async findById(id: string): Promise<NullableType<User>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<NullableType<User>> {
    return this.userRepository.findByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<NullableType<User>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    let hashedPassword = updateUserDto.password;
    if (updateUserDto.password) {
      hashedPassword = await argon2.hash(updateUserDto.password, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
      });
    }

    return this.userRepository.update(id, {
      ...updateUserDto,
      password: hashedPassword ?? user.password,
    });
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.delete(id);
  }

  async count(): Promise<number> {
    return this.userRepository.count();
  }
}

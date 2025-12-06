import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../infrastructure/user.repository';
import { UserCreateProps, UserUpdateProps } from './user.type';
import { UserDomain } from './user.domain';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(props: UserCreateProps): Promise<void> {
    await this.userRepository.createUser(props);
  }

  async updateUser(idx: number, props: UserUpdateProps): Promise<void> {
    await this.userRepository.updateUser(idx, props);
  }

  async deleteUser(idx: number): Promise<void> {
    await this.userRepository.deleteUser(idx);
  }

  async findUserByIdx(idx: number): Promise<UserDomain> {
    const user = await this.userRepository.findUserByIdx(idx);
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  async findUserList(): Promise<UserDomain[]> {
    return await this.userRepository.findUserList();
  }
}

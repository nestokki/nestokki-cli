import { Injectable } from '@nestjs/common';
import { UserRepository } from '../infrastructure/user.repository';
import { UserCreateProps, UserUpdateProps } from './user.type';

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
}

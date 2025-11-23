import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../infrastructure/user.repository';
import { UserDomain } from './model/user.domain';

/** Pagination limit type (remove these in real use!) */
declare enum PageLimit {
  PER_PAGE_10 = 10,
  PER_PAGE_20 = 20,
  PER_PAGE_50 = 50,
  PER_PAGE_100 = 100,
}
/*******************************************************/

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(required: string, nullable: string | null): Promise<void> {
    await this.userRepository.createUser(UserDomain.create({ required, nullable }));
  }
  async updateUser(
    domain: UserDomain,
    idx: number,
    required?: string,
    nullable?: string | null,
  ): Promise<void> {
    await this.userRepository.updateUser(idx, UserDomain.update(domain, { required, nullable }));
  }
  async removeUser(idx: number): Promise<void> {
    await this.userRepository.removeUser(idx);
  }

  async findUserByIdx(idx: number): Promise<UserDomain> {
    const user = await this.userRepository.findUserByIdx(idx);
    if (!user) throw new NotFoundException('user not found');
    return user;
  }
  async findUserList(page: number, limit: PageLimit): Promise<[UserDomain[], number]> {
    return await this.userRepository.findUserList(page, limit);
  }

  async findUserModel(idx: number): Promise<UserDomain> {
    const user = await this.userRepository.findUserModelByIdxWithRelations(idx);
    if (!user) throw new NotFoundException('user not found');
    return user;
  }
  async findUserModelList(page: number, limit: PageLimit): Promise<[UserDomain[], number]> {
    return await this.userRepository.findUserModelListWithRelations(page, limit);
  }

  async throwIfUserExistsByUnique(idx: number): Promise<void> {
    const user = await this.userRepository.findUserByIdx(idx);
    if (user) throw new ConflictException('user already exists');
  }
}

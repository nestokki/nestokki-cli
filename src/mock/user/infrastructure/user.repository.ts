import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UserCreateProps, UserUpdateProps } from '../domain/user.type';
import { UserEntity } from './user.entity';
import { UserMapper } from './user.mapper';

@Injectable()
export class UserRepository {
  constructor(@InjectRepository(UserEntity) private readonly typeOrm: Repository<UserEntity>) {}

  private repository(manager?: EntityManager): Repository<UserEntity> {
    return manager ? manager.getRepository(UserEntity) : this.typeOrm;
  }

  async createUser(props: UserCreateProps, manager?: EntityManager): Promise<void> {
    await this.repository().save(UserMapper.toEntity(props));
  }

  async updateUser(idx: number, props: UserUpdateProps, manager?: EntityManager): Promise<void> {
    await this.repository().update({ idx }, UserMapper.toPartialEntity(props));
  }

  async deleteUser(idx: number, manager?: EntityManager): Promise<void> {
    await this.repository().delete({ idx });
  }
}

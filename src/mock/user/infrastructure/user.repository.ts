import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UserCreateProps, UserUpdateProps } from '../domain/user.type';
import { UserDomain } from '../domain/user.domain';
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

  async findUserByIdx(idx: number, manager?: EntityManager): Promise<UserDomain | null> {
    const entity = await this.repository()
      .createQueryBuilder('user')
      .where('user.idx = :idx', { idx })
      .getOne();

    return entity && UserMapper.toDomain(entity);
  }

  async findUserList(): Promise<UserDomain[]> {
    const entities = await this.repository()
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC')
      .getMany();

    return entities.map(UserMapper.toDomain);
  }
}

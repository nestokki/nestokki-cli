import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { UserDomain } from '../domain/model/user.domain';
import { UserUpdateProps } from './test-props.interface';
import { UserEntity } from './user.entity';
import { UserMapper } from './user.mapper';

/** Pagination limit type (remove these in real use!) */
declare enum PageLimit {
  PER_PAGE_10 = 10,
  PER_PAGE_20 = 20,
  PER_PAGE_50 = 50,
  PER_PAGE_100 = 100,
}
/*******************************************************/

@Injectable()
export class UserRepository {
  constructor(@InjectRepository(UserEntity) private readonly typeOrm: Repository<UserEntity>) {}

  private repository(manager?: EntityManager): Repository<UserEntity> {
    return manager ? manager.getRepository(UserEntity) : this.typeOrm;
  }

  async createUser(domain: UserDomain, manager?: EntityManager): Promise<void> {
    await this.repository().save(UserMapper.toEntity(domain));
  }

  async updateUser(idx: number, props: UserUpdateProps, manager?: EntityManager): Promise<void> {
    await this.repository().update({ idx }, UserMapper.toPartialEntity(props));
  }

  async removeUser(idx: number, manager?: EntityManager): Promise<void> {
    await this.repository().delete({ idx });
  }

  async findUserByIdx(idx: number, manager?: EntityManager): Promise<UserDomain | null> {
    const entity = await this.repository()
      .createQueryBuilder('user')
      .where('user.idx = :idx', { idx })
      .getOne();

    return entity && UserMapper.toDomain(entity);
  }

  async findUserList(page: number, limit: PageLimit): Promise<[UserDomain[], number]> {
    const [entities, total] = await this.repository()
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return [entities.map(UserMapper.toDomain), total];
  }

  async findUserModelByIdxWithRelations(idx: number): Promise<UserDomain | null> {
    const entity = await this.repository()
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.oneToMany', 'oneToMany')
      .where('user.idx = :idx', { idx })
      .getOne();

    return entity && UserMapper.toDomain(entity);
  }

  async findUserModelListWithRelations(
    page: number,
    limit: PageLimit,
  ): Promise<[UserDomain[], number]> {
    const [entities, total] = await this.repository()
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.oneToMany', 'oneToMany')
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return [entities.map(UserMapper.toDomain), total];
  }
}

import { UserDomain } from '../domain/user.domain';
import { UserCreateProps, UserDomainProps, UserUpdateProps } from '../domain/user.type';
import { UserEntity } from './user.entity';

const isNil = (v: unknown): v is null | undefined => v == null;
const mapManyToOne = <T, R>(v: T | null | undefined, fn: (x: T) => R): R | null | undefined =>
  isNil(v) ? v : fn(v);
const mapOneToMany = <T, R>(v: readonly T[] | undefined, fn: (x: T) => R): R[] | undefined =>
  isNil(v) ? v : v.map(fn);

export class UserMapper {
  static toDomain(entity: UserEntity): UserDomain {
    const userDomainProps: UserDomainProps = {
      idx: entity.idx,
      required: entity.required,
      nullable: entity.nullable,
      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,
      // orders: mapOneToMany(entity.orders, OrderMapper.toDomain),
    };

    return UserDomain.fromEntity(userDomainProps);
  }

  // Insert Command
  static toEntity(props: UserCreateProps): UserEntity {
    const entity = new UserEntity();

    entity.required = props.required;
    entity.nullable = props.nullable;

    return entity;
  }

  // Update Command
  static toPartialEntity(props: UserUpdateProps): Partial<UserEntity> {
    const entity = new UserEntity();

    if (props.required !== undefined) entity.required = props.required;
    if (props.nullable !== undefined) entity.nullable = props.nullable;

    return entity;
  }
}

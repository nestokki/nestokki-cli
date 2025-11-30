import { UserDomainProps, UserUpdateProps } from './test-props.interface';
import { UserDomain } from './test.domain';
import { UserEntity } from './test.entity';

/** Checks if a value is null or undefined (uses loose equality to catch both). */
const isNil = (v: unknown): v is null | undefined => v == null;

/** Maps a many-to-one relation. preserves undefined/null, converts value via fn otherwise. */
const mapManyToOne = <T>(v: T | null | undefined, fn: (x: T) => any) => (isNil(v) ? v : fn(v));

/** Maps a one-to-many relation. preserves undefined, maps each item via fn otherwise. */
const mapOneToMany = <T>(v: readonly T[] | undefined, fn: (x: T) => any) =>
  isNil(v) ? v : v.map(fn);

export class UserMapper {
  /** Entity -> Domain */
  static toDomain(entity: UserEntity): UserDomain {
    const props: UserDomainProps = {
      idx: entity.idx,
      required: entity.required,
      nullable: entity.nullable,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      // manyToOne: mapManyToOne(entity.manyToOne, ManyToOneMapper.toDomain),
      // oneToMany: mapOneToMany(entity.oneToMany, OneToManyMapper.toDomain),
    };

    return UserDomain.fromEntity(props);
  }

  /** Domain -> Entity */
  static toEntity(domain: UserDomain): UserEntity {
    const props = domain.toCreateProps();
    const entity = new UserEntity();

    entity.required = props.required;
    entity.nullable = props.nullable;

    return entity;
  }

  /** Domain (partial) -> Entity (partial) */
  static toPartialEntity(props: UserUpdateProps): Partial<UserEntity> {
    const entity = new UserEntity();

    if (props.required) entity.required = props.required;
    if (props.nullable !== undefined) entity.nullable = props.nullable;

    return entity;
  }
}

/** Example domain types (remove these in real use!) */
type ManyToOneDomain = {};
type OneToManyDomain = {};

interface UserPk {
  idx: number;
}

interface UserRequiredProps {
  required: string;
}

interface UserNullableProps {
  nullable: string | null;
}

interface UserDefaultProps {
  updatedAt: Date;
  createdAt: Date;
}

interface UserRelationProps {
  manyToOne?: ManyToOneDomain | null;
  oneToMany?: readonly OneToManyDomain[];
}

export type UserDomainProps = UserPk &
  UserRequiredProps &
  UserNullableProps &
  UserDefaultProps &
  UserRelationProps;

export type UserCreateProps = UserRequiredProps & UserNullableProps;

export type UserUpdateProps = Partial<UserRequiredProps & UserNullableProps>;

interface UserPk {
  idx: number;
}

interface UserFk {
  // userIdx: number | null;
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

interface UserRelationProps {}

export type UserDomainProps = UserPk &
  UserFk &
  UserRequiredProps &
  UserNullableProps &
  UserDefaultProps &
  UserRelationProps;

export type UserCreateProps = UserFk & UserRequiredProps & UserNullableProps;

export type UserUpdateProps = Partial<UserRequiredProps & UserNullableProps>;

// /** Example domain types (remove these in real use!) */
// type ManyToOneDomain = {};
// type OneToManyDomain = {};

// interface UserPk {
//   idx: number;
// }

// interface UserFk {
//   manyToOneIdx: number | null;
// }

// interface UserRequiredProps {
//   required: string;
// }

// interface UserNullableProps {
//   nullable: string | null;
// }

// interface UserDefaultProps {
//   updatedAt: Date;
//   createdAt: Date;
// }

// interface UserRelationProps {
//   manyToOne?: ManyToOneDomain | null;
//   oneToMany?: readonly OneToManyDomain[];
// }

// export type UserDomainProps = UserPk &
//   UserFk &
//   UserRequiredProps &
//   UserNullableProps &
//   UserDefaultProps &
//   UserRelationProps;

// export type UserCreateProps = UserFk & UserRequiredProps & UserNullableProps;

// export type UserUpdateProps = Partial<UserRequiredProps & UserNullableProps>;

import { UserDomain } from '../../../domain/user.domain';

export interface UserListItemProps {
  idx: number;
  require: string;
  nullable: string | null;
  updatedAt: Date;
  createdAt: Date;
}

export class UserListItemModel {
  private constructor(private readonly props: UserListItemProps) {}

  static fromUser(user: UserDomain): UserListItemModel {
    return new UserListItemModel({
      idx: user.idx,
      require: user.required,
      nullable: user.nullable,
      updatedAt: user.updatedAt,
      createdAt: user.createdAt,
    });
  }

  get idx(): number {
    return this.props.idx;
  }
  get require(): string {
    return this.props.require;
  }
  get nullable(): string | null {
    return this.props.nullable;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
}

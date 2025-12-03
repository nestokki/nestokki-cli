import { UserDomain } from '../../../domain/user.domain';

interface UserListItemProps {
  idx: number;
  required: string;
  nullable: string | null;
  updatedAt: Date;
  createdAt: Date;
}

export class UserListItemModel {
  private constructor(private readonly props: UserListItemProps) {}

  static fromUser(user: UserDomain): UserListItemModel {
    return new UserListItemModel({
      idx: user.idx,
      required: user.required,
      nullable: user.nullable,
      updatedAt: user.updatedAt,
      createdAt: user.createdAt,
    });
  }

  get idx(): number {
    return this.props.idx;
  }
  get required(): string {
    return this.props.required;
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

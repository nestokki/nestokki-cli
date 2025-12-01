import { UserDomain } from '../../../domain/user.domain';

export interface UserDetailProps {
  require: string;
  nullable: string | null;
  createdAt: Date;
}

export class UserDetailModel {
  private constructor(private readonly props: UserDetailProps) {}

  static fromUser(user: UserDomain): UserDetailModel {
    return new UserDetailModel({
      require: user.required,
      nullable: user.nullable,
      createdAt: user.createdAt,
    });
  }

  get require(): string {
    return this.props.require;
  }
  get nullable(): string | null {
    return this.props.nullable;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
}

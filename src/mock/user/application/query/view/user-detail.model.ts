import { UserDomain } from '../../../domain/user.domain';

interface UserDetailProps {
  required: string;
  nullable: string | null;
  createdAt: Date;
}

export class UserDetailModel {
  private constructor(private readonly props: UserDetailProps) {}

  static fromUser(user: UserDomain): UserDetailModel {
    return new UserDetailModel({
      required: user.required,
      nullable: user.nullable,
      createdAt: user.createdAt,
    });
  }

  get required(): string {
    return this.props.required;
  }
  get nullable(): string | null {
    return this.props.nullable;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
}

import { UserDomainProps } from './user.type';

export class UserDomain {
  private constructor(private readonly props: UserDomainProps) {}

  static fromEntity(props: UserDomainProps): UserDomain {
    return new UserDomain(props);
  }

  get idx(): number {
    return this.props.idx;
  }
  get required(): string {
    return this.props.required;
  }
  get nullable(): string | null {
    return this.props.nullable ?? null;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}

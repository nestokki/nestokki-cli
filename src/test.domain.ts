import { UserCreateProps, UserDomainProps, UserUpdateProps } from './test-domain.props';

/** Example domain types (remove these in real use!) */
type ManyToOneDomain = {};
type OneToManyDomain = {};

export class UserDomain {
  private constructor(private readonly props: UserDomainProps) {}

  static create(props: UserCreateProps): UserDomain {
    const userDomainProps: UserDomainProps = {
      idx: 0,
      required: props.required,
      nullable: props.nullable,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new UserDomain(userDomainProps);
  }

  static update(targetDomain: UserDomain, props: UserUpdateProps): UserUpdateProps {
    const hasUpdate = Object.values(props).some((v) => v !== undefined);

    if (!hasUpdate) throw new Error('No fields to update');

    const target = targetDomain.toProps();
    const isSame = Object.entries(props).every(([k, v]) => target[k as keyof typeof target] === v);

    if (isSame) throw new Error('Nothing changed');

    return props;
  }

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
  get manyToOne(): ManyToOneDomain | null | undefined {
    return this.props.manyToOne;
  }
  get oneToMany(): readonly OneToManyDomain[] | undefined {
    return this.props.oneToMany;
  }

  private toProps(): Readonly<UserDomainProps> {
    return { ...this.props };
  }

  toCreateProps(): Readonly<UserCreateProps> {
    return { ...this.props };
  }
}

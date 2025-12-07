import { UserCreateProps } from '../../../domain/user.type';

export class CreateUserCommand {
  private constructor(private readonly props: UserCreateProps) {}

  static create(props: UserCreateProps): CreateUserCommand {
    return new CreateUserCommand(props);
  }

  toCreateProps(): UserCreateProps {
    return {
      required: this.props.required,
      nullable: this.props.nullable,
    };
  }
}

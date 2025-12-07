import { BadRequestException } from '@nestjs/common';
import { UserUpdateProps } from '../../../domain/user.type';

export class UpdateUserCommand {
  private constructor(
    readonly idx: number,
    private readonly props: UserUpdateProps,
  ) {}

  static create(idx: number, props: UserUpdateProps): UpdateUserCommand {
    if (Object.keys(props).length === 0) {
      throw new BadRequestException('No update fields provided');
    }

    return new UpdateUserCommand(idx, props);
  }

  toUpdateProps(): UserUpdateProps {
    return {
      required: this.props.required,
      nullable: this.props.nullable,
    };
  }
}

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateUserCommand } from 'src/api/user/application/command/action/create-user.command';
import { UserCreateProps } from 'src/api/user/domain/user.type';

export class CreateUserRequestDto {
  @IsNotEmpty()
  @IsString()
  required: string;

  @IsOptional()
  @IsString()
  nullable?: string;

  toCreateProps(): UserCreateProps {
    return {
      required: this.required,
      nullable: this.nullable ?? null,
    };
  }

  toCommand(): CreateUserCommand {
    return CreateUserCommand.create(this.toCreateProps());
  }
}

import { IsOptional, IsString } from 'class-validator';
import { UpdateUserCommand } from 'src/api/user/application/command/action/update-user.command';
import { UserUpdateProps } from 'src/api/user/domain/user.type';

export class UpdateUserRequestDto {
  @IsOptional()
  @IsString()
  required?: string;

  @IsOptional()
  @IsString()
  nullable?: string;

  toUpdateProps(): UserUpdateProps {
    return {
      ...(this.required !== undefined && { required: this.required }),
      ...(this.nullable !== undefined && { nullable: this.nullable }),
    };
  }

  toCommand(idx: number): UpdateUserCommand {
    return UpdateUserCommand.create(idx, this.toUpdateProps());
  }
}

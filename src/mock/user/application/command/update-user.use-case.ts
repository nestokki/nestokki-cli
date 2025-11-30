import { Injectable } from '@nestjs/common';
import { UserService } from '../../domain/user.service';
import { UpdateUserCommand } from './action/update-user.command';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(command: UpdateUserCommand): Promise<void> {
    return await this.userService.updateUser(command.idx, command.toUpdateProps());
  }
}

import { Injectable } from '@nestjs/common';
import { UserService } from '../../domain/user.service';
import { CreateUserCommand } from './action/create-user.command';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(command: CreateUserCommand): Promise<void> {
    return await this.userService.createUser(command.toCreateProps());
  }
}

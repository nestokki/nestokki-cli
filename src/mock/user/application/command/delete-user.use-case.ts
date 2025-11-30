import { Injectable } from '@nestjs/common';
import { UserService } from '../../domain/user.service';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(idx: number): Promise<void> {
    return await this.userService.deleteUser(idx);
  }
}

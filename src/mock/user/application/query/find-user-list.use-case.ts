import { Injectable } from '@nestjs/common';
import { UserService } from '../../domain/user.service';
import { UserDomain } from '../../domain/user.domain';

@Injectable()
export class FindUserListUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(): Promise<UserDomain[]> {
    return await this.userService.findUserList();
  }
}

import { Injectable } from '@nestjs/common';
import { UserService } from '../../domain/user.service';
import { UserListItemModel } from './view/user-list-item.model';

@Injectable()
export class FindUserListUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(): Promise<UserListItemModel[]> {
    const userList = await this.userService.findUserList();
    return userList.map(UserListItemModel.fromUser);
  }
}

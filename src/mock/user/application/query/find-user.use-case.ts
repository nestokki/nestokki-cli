import { Injectable } from '@nestjs/common';
import { UserService } from '../../domain/user.service';
import { UserDetailModel } from './view/user-detail.model';

@Injectable()
export class FindUserUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(idx: number): Promise<UserDetailModel> {
    const user = await this.userService.findUserByIdx(idx);
    return UserDetailModel.fromUser(user);
  }
}

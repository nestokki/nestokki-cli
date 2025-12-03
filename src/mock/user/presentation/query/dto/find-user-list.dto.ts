import { UserListItemModel } from '../../../application/query/view/user-list-item.model';

class userListItemDto {
  readonly idx: number;
  readonly required: string;
  readonly nullable: string | null;
  readonly updatedAt: Date;
  readonly createdAt: Date;

  private constructor(model: UserListItemModel) {
    this.idx = model.idx;
    this.required = model.required;
    this.nullable = model.nullable;
    this.updatedAt = model.updatedAt;
    this.createdAt = model.createdAt;
  }

  static from(model: UserListItemModel): userListItemDto {
    return new userListItemDto(model);
  }
}

export class FindUserListResponseDto {
  readonly userList: userListItemDto[];

  private constructor(userList: userListItemDto[]) {
    this.userList = userList;
  }

  static from(modelList: UserListItemModel[]): FindUserListResponseDto {
    const userList = modelList.map(userListItemDto.from);
    return new FindUserListResponseDto(userList);
  }
}

import { UserListItemModel } from '../../../application/query/view/user-list-item.model';

class userListItemResponse {
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

  static from(model: UserListItemModel): userListItemResponse {
    return new userListItemResponse(model);
  }
}

export class FindUserListResponseDto {
  readonly userList: userListItemResponse[];

  private constructor(userList: userListItemResponse[]) {
    this.userList = userList;
  }

  static from(modelList: UserListItemModel[]): FindUserListResponseDto {
    const userList = modelList.map(userListItemResponse.from);
    return new FindUserListResponseDto(userList);
  }
}

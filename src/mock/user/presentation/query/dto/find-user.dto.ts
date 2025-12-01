import { UserDetailModel } from '../../../application/query/view/user-detail.model';

export class FindUserResponseDto {
  readonly required: string;

  readonly nullable: string | null;

  readonly createdAt: Date;

  private constructor(model: UserDetailModel) {
    this.required = model.required;
    this.nullable = model.nullable;
    this.createdAt = model.createdAt;
  }

  static from(model: UserDetailModel): FindUserResponseDto {
    return new FindUserResponseDto(model);
  }
}

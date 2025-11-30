import { UserDomain } from 'src/api/user/domain/user.domain';

export class FindUserResponseDto {
  readonly idx: number;

  readonly required: string;

  readonly nullable: string | null;

  readonly createdAt: Date;

  readonly updatedAt: Date;

  private constructor(
    private readonly dto: {
      idx: number;
      required: string;
      nullable: string | null;
      createdAt: Date;
      updatedAt: Date;
    },
  ) {
    this.idx = dto.idx;
    this.required = dto.required;
    this.nullable = dto.nullable;
    this.createdAt = dto.createdAt;
    this.updatedAt = dto.updatedAt;
  }

  static from(domain: UserDomain): FindUserResponseDto {
    return new FindUserResponseDto({
      idx: domain.idx,
      required: domain.required,
      nullable: domain.nullable,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    });
  }
}

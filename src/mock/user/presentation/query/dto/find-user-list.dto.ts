import { UserDomain } from 'src/api/user/domain/user.domain';
import { FindUserResponseDto } from './find-user.dto';

export class FindUserListResponseDto {
  readonly userList: FindUserResponseDto[];

  private constructor(
    private readonly dto: {
      userList: FindUserResponseDto[];
    },
  ) {
    this.userList = dto.userList;
  }

  static from(domains: UserDomain[]): FindUserListResponseDto {
    const userList = domains.map(FindUserResponseDto.from);
    return new FindUserListResponseDto({ userList });
  }
}

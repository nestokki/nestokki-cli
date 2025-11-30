import { Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe } from '@nestjs/common';
import { FindUserUseCase } from '../../application/query/find-user.use-case';
import { FindUserListUseCase } from '../../application/query/find-user-list.use-case';
import { FindUserResponseDto } from './dto/find-user.dto';
import { FindUserListResponseDto } from './dto/find-user-list.dto';

@Controller('users')
export class UserCommandController {
  constructor(
    private readonly findUserUseCase: FindUserUseCase,
    private readonly findUserListUseCase: FindUserListUseCase,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get('/:userId')
  async findUser(@Param('userId', ParseIntPipe) idx: number): Promise<FindUserResponseDto> {
    const user = await this.findUserUseCase.execute(idx);
    return FindUserResponseDto.from(user);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/')
  async findUserList(): Promise<FindUserListResponseDto> {
    const userList = await this.findUserListUseCase.execute();
    return FindUserListResponseDto.from(userList);
  }
}

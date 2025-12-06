import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserUseCase } from '../../application/command/create-user.use-case';
import { UpdateUserUseCase } from '../../application/command/update-user.use-case';
import { DeleteUserUseCase } from '../../application/command/delete-user.use-case';
import { CreateUserRequestDto } from './dto/create-user.dto';
import { UpdateUserRequestDto } from './dto/update-user.dto';

@Controller('users')
export class UserCommandController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/')
  async createUser(@Body() dto: CreateUserRequestDto): Promise<void> {
    await this.createUserUseCase.execute(dto.toCommand());
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('/:userId')
  async updateUser(
    @Param('userId', ParseIntPipe) idx: number,
    @Body() dto: UpdateUserRequestDto,
  ): Promise<void> {
    await this.updateUserUseCase.execute(dto.toCommand(idx));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:userId')
  async deleteUser(@Param('userId', ParseIntPipe) idx: number): Promise<void> {
    return await this.deleteUserUseCase.execute(idx);
  }
}

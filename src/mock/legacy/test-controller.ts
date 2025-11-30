// import { Controller, HttpCode, HttpStatus, Get, Param, ParseIntPipe } from '@nestjs/common';
// import { FindUserUseCase } from '../application/find-user.use-case';

// @Controller('users')
// export class UserController {
//   constructor(private readonly findUserUseCase: FindUserUseCase) {}

//   @HttpCode(HttpStatus.OK)
//   @Get('/:userId')
//   async findUser(@Param('userId', ParseIntPipe) idx: number): Promise<any> {
//     return await this.findUserUseCase.execute(idx);
//   }
// }

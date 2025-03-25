import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { CreateUserRequestDto } from './dto/create-user.request';
import { UsersService } from './users.service';
import { NoFilesInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	@Post()
	@UseInterceptors(NoFilesInterceptor())
	createUser(@Body() payload: CreateUserRequestDto) {
		return this.usersService.createUser(payload)
	}
}

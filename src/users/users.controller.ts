import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserRequestDto } from './dto/create-user.request';

@Controller('users')
export class UsersController {
	@Post()
	createUser(@Body() payload: CreateUserRequestDto) {
		
	}
}

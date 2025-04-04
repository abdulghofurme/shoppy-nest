import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateUserRequestDto } from './dto/create-user.request';
import { UsersService } from './users.service';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { TJWTUser } from 'src/auth/strategies/jwt.strategy';
import { ProductsService } from 'src/products/products.service';

@Controller('users')
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly productsService: ProductsService
	) { }

	@Post()
	@UseInterceptors(NoFilesInterceptor())
	createUser(@Body() payload: CreateUserRequestDto) {
		return this.usersService.createUser(payload)
	}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	getMe(
		@CurrentUser() user: TJWTUser
	) {
		return user
	}

	@Get('products')
	@UseGuards(JwtAuthGuard)
	getProducts(
		@CurrentUser() user: TJWTUser
	) {
		return this.productsService.get({ userId: user.id })
	}
}

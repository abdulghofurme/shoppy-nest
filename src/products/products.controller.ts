import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateProductRequestDto } from './dto/create-product.request';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { ProductsService } from './products.service';
import { TJWTUser } from 'src/auth/strategies/jwt.strategy';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { extname } from 'path';

@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) { }

	@Post()
	@UseGuards(JwtAuthGuard)
	create(
		@Body() payload: CreateProductRequestDto,
		@CurrentUser() user: TJWTUser
	) {
		return this.productsService.create(payload, user.id);
	}

	@Get()
	get() {
		return this.productsService.get();
	}
}

import { Injectable } from '@nestjs/common';
import { CreateProductRequestDto } from './dto/create-product.request';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
	constructor(private readonly prismaService: PrismaService) { }

	create(payload: CreateProductRequestDto, userId: number) {
		// Create a new product
		return this.prismaService.product.create({
			data: {
				...payload,
				userId
			}
		})
	}
}

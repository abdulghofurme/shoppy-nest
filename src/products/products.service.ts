import { Injectable } from '@nestjs/common';
import { CreateProductRequestDto } from './dto/create-product.request';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

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

	get(where?: Prisma.ProductWhereInput) {
		return this.prismaService.product.findMany({
			where
		})
	}
}

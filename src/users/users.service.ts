import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt'
import { CreateUserRequestDto } from './dto/create-user.request';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
	constructor(private readonly prismaService: PrismaService) { }

	async createUser(payload: CreateUserRequestDto): Promise<User> {
		return await this.prismaService.user.create({
			data: {
				...payload,
				password: await bcrypt.hasch(payload.password, 10)
			}
		})
	}
}

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt'
import { CreateUserRequestDto } from './dto/create-user.request';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
	constructor(private readonly prismaService: PrismaService) { }

	async createUser(payload: CreateUserRequestDto): Promise<Omit<User, 'password'>> {
		return this.prismaService.user.create({
			data: {
				...payload,
				password: await bcrypt.hash(payload.password, 10)
			},
			omit: {
				password: true
			}
		})
	}
}

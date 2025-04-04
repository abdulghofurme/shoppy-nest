import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt'
import { CreateUserRequestDto } from './dto/create-user.request';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

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

	async getUser(filter: Prisma.UserWhereUniqueInput, options?: { select?: Prisma.UserSelect, omit?: Prisma.UserOmit }) {
		return this.prismaService.user.findUniqueOrThrow({
			where: filter,
			...options || {}
		})
	}
}

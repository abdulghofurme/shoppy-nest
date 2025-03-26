import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt'
import { Response } from 'express';
import ms, { StringValue } from 'ms';
import { UsersService } from 'src/users/users.service';
import { TTokenPayload } from './token-payload';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
	) { }

	async verifyUser(email: string, password: string) {
		try {
			const user = await this.usersService.getUser({ email })
			const authenticated = await bcrypt.compare(password, user.password)
			if (!authenticated) {
				throw new UnauthorizedException()
			}
		} catch (error) {
			throw new UnauthorizedException('Credentials are not valid.')
		}
	}

	async login(user: User, response: Response) {
		const expires = new Date()
		expires.setMilliseconds(
			expires.getMilliseconds() + ms(
				this.configService.getOrThrow<StringValue>('JWT_EXPIRATION')
			)
		)

		const tokenPayload: TTokenPayload = {
			userId: user.id
		}
		const token = this.jwtService.sign(tokenPayload)

		response.cookie('Authentication', token, {
			secure: true,
			httpOnly: true,
			expires,
		})

		return tokenPayload
	}
}

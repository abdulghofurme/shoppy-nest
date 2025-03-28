import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TTokenPayload } from "../token-payload";
import { UsersService } from "src/users/users.service";
import { User } from "@prisma/client";

export type TJWTUser = Omit<User, 'password'>	 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly configService: ConfigService, private readonly usersService: UsersService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => request.cookies.Authentication
			]),
			secretOrKey: configService.getOrThrow('JWT_SECRET')
		})
	}

	async validate(payload: TTokenPayload) : Promise<TJWTUser> {
		return this.usersService.getUser({ id: payload.userId }, { omit: { password: true } })
	}
}
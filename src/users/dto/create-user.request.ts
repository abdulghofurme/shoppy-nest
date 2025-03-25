import { IsEmail, IsStrongPassword } from "class-validator";

export class CreateUserRequestDto {
	@IsEmail()
	email: string;

	@IsStrongPassword()
	password: string;
}
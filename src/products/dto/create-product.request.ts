import { IsNotEmpty,  IsNumber,  IsString } from "class-validator"

export class CreateProductRequestDto {
	@IsString()
	@IsNotEmpty()
	name: string

	@IsString()
	@IsNotEmpty()
	description: string

	@IsNumber()
	price: number
}
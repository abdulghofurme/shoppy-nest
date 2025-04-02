import { Type } from "class-transformer"
import { IsNotEmpty,  IsNumber,  IsString } from "class-validator"

export class CreateProductRequestDto {
	@IsString()
	@IsNotEmpty()
	name: string

	@IsString()
	@IsNotEmpty()
	description: string

	@Type(() => Number)
	@IsNumber()
	price: number

	@IsString()
	@IsNotEmpty()
	image: string
}
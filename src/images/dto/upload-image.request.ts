import { IsString } from "class-validator";

export class UploadImageRequestDto {
	@IsString()
	relative_path: string
}
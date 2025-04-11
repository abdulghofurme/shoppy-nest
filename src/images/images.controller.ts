import {
	BadRequestException,
	Body,
	Controller,
	FileTypeValidator,
	MaxFileSizeValidator,
	ParseFilePipe,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UploadImageRequestDto } from './dto/upload-image.request';
import { mkdirSync, renameSync, unlinkSync, existsSync } from 'fs';

interface FileUploadResponse {
	message: string;
	data: {
		filename: string;
		path: string;
		size: number;
		mimetype: string;
	};
}

@Controller('images')
export class ImagesController {
	private static readonly UPLOAD_CONFIG = {
		MAX_SIZE: 5_000_000, // 5MB
		ALLOWED_MIME_TYPES: /^image\/(jpeg|png|gif|webp)$/,
		TEMP_DIR: 'temp',
		BASE_UPLOAD_DIR: join(__dirname, '..', '..', 'public', 'file'),
	};

	private validateUpload(upload: UploadImageRequestDto, file?: Express.Multer.File): void {
		if (!file) {
			throw new BadRequestException('No file uploaded');
		}
		if (!upload.relative_path) {
			throw new BadRequestException('relative_path is required');
		}
	}

	private moveFile(file: Express.Multer.File, relativePath: string): void {
		const finalDir = join(ImagesController.UPLOAD_CONFIG.BASE_UPLOAD_DIR, relativePath);
		const finalPath = join(finalDir, file.filename);

		try {
			mkdirSync(finalDir, { recursive: true });
			renameSync(file.path, finalPath);
			file.path = finalPath;
		} catch (error) {
			this.cleanupFile(file);
			throw new BadRequestException('Failed to move file to final location');
		}
	}

	private cleanupFile(file: Express.Multer.File): void {
		if (file.path && existsSync(file.path)) {
			try {
				unlinkSync(file.path);
			} catch (cleanupError) {
				console.error('Failed to clean up temp file:', cleanupError);
			}
		}
	}

	@Post()
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(
		FileInterceptor('image', {
			storage: multer.diskStorage({
				destination: (_req, _file, cb) => {
					const tempDir = join(ImagesController.UPLOAD_CONFIG.BASE_UPLOAD_DIR, ImagesController.UPLOAD_CONFIG.TEMP_DIR);
					mkdirSync(tempDir, { recursive: true });
					cb(null, tempDir);
				},
				filename: (_req, file, cb) => {
					const extension = extname(file.originalname);
					const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
					cb(null, uniqueFilename);
				},
			}),
			fileFilter: (_req, file, cb) => {
				if (!file.mimetype.match(ImagesController.UPLOAD_CONFIG.ALLOWED_MIME_TYPES)) {
					return cb(new BadRequestException('Only image files are allowed'), false);
				}
				cb(null, true);
			},
		}),
	)
	async uploadImage(
		@Body() upload: UploadImageRequestDto,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: ImagesController.UPLOAD_CONFIG.MAX_SIZE }),
					new FileTypeValidator({ fileType: 'image/*' }),
				],
			}),
		) file?: Express.Multer.File,
	): Promise<FileUploadResponse> {
		this.validateUpload(upload, file);
		if (!file) {
			throw new BadRequestException('No file uploaded');
		}
		this.moveFile(file, upload.relative_path);
		return {
			message: 'File uploaded successfully',
			data: {
				filename: file.filename,
				path: `/file/${upload.relative_path}/${file.filename}`,
				size: file.size,
				mimetype: file.mimetype,
			},
		}
	}
}

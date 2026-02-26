import { IsOptional, IsString } from 'class-validator';

export class UploadPhotoDto {
  @IsString()
  filename!: string;

  @IsString()
  mimeType!: string;

  @IsString()
  base64!: string;

  @IsOptional()
  @IsString()
  tankId?: string;
}

import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { promises as fs } from 'fs';
import { join } from 'path';
import { PrismaService } from './prisma.service';
import { UploadPhotoDto } from './upload.dto';

@ApiTags('uploads')
@Controller('v1/uploads')
export class UploadsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('photo')
  async upload(@Body() body: UploadPhotoDto) {
    await fs.mkdir(join(process.cwd(), 'uploads'), { recursive: true });
    const path = join('uploads', `${Date.now()}-${body.filename}`);
    await fs.writeFile(join(process.cwd(), path), Buffer.from(body.base64, 'base64'));
    const rec = await this.prisma.uploadedPhoto.create({
      data: { path, mimeType: body.mimeType, tankId: body.tankId },
    });
    return { id: rec.id, path: `/${path}` };
  }
}

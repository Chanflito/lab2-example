import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UserStorageService } from './user-storage.service';
import { UploadAvatarDto, UploadAvatarResponseDto } from './dto/upload-avatar.dto';
import { PresignedUrlResponseDto } from './dto/presigned-url.dto';
import { UploadUrlResponseDto } from './dto/upload-url.dto';
import { ConfirmUploadDto, ConfirmUploadResponseDto } from './dto/confirm-upload.dto';

@ApiTags('User Storage')
@Controller('users')
export class UserStorageController {
  constructor(private readonly userStorageService: UserStorageService) {}

  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload user avatar',
    description: 'Upload a new avatar image for a user. The image will be stored in Azure Blob Storage and the user\'s imageUrl will be updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar image file',
    type: UploadAvatarDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Avatar uploaded successfully',
    type: UploadAvatarResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file type, file too large, or upload failed',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async uploadAvatar(
    @Param('id', ParseUUIDPipe) userId: string,
    @UploadedFile() file: any,
  ): Promise<UploadAvatarResponseDto> {
    const imageUrl = await this.userStorageService.uploadUserAvatar(userId, file);

    return {
      imageUrl,
      message: 'Avatar uploaded successfully',
    };
  }

  @Post(':id/avatar/upload-url')
  @ApiOperation({
    summary: 'Generate presigned URL for direct upload',
    description: 'Generate a temporary presigned URL that allows direct upload to Azure Blob Storage. The URL expires after 15 minutes.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Upload URL generated successfully',
    type: UploadUrlResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to generate upload URL',
  })
  async generateUploadUrl(
    @Param('id', ParseUUIDPipe) userId: string,
  ): Promise<UploadUrlResponseDto> {
    const { uploadUrl, fileName } = await this.userStorageService.generateUploadPresignedUrl(userId);

    // Calculate expiration time (15 minutes from now)
    const expiresAt = new Date(Date.now() + 900 * 1000).toISOString();

    return {
      uploadUrl,
      fileName,
      expiresAt,
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': 'application/octet-stream',
      },
      message: 'Upload URL generated successfully',
    };
  }

  @Post(':id/avatar/confirm')
  @ApiOperation({
    summary: 'Confirm avatar upload',
    description: 'Confirm that the avatar has been uploaded successfully and update the user\'s imageUrl in the database.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    type: ConfirmUploadDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Avatar upload confirmed successfully',
    type: ConfirmUploadResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'File was not uploaded successfully or failed to confirm upload',
  })
  async confirmUpload(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() confirmUploadDto: ConfirmUploadDto,
  ): Promise<ConfirmUploadResponseDto> {
    const imageUrl = await this.userStorageService.confirmUpload(userId, confirmUploadDto.fileName);

    return {
      imageUrl,
      message: 'Avatar upload confirmed successfully',
    };
  }

  @Get(':id/avatar/presigned-url')
  @ApiOperation({
    summary: 'Get presigned URL for user avatar',
    description: 'Generate a temporary presigned URL to access the user\'s avatar image. The URL expires after 1 hour.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Presigned URL generated successfully',
    type: PresignedUrlResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found or user has no avatar image',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to generate presigned URL',
  })
  async getPresignedUrl(
    @Param('id', ParseUUIDPipe) userId: string,
  ): Promise<PresignedUrlResponseDto> {
    const presignedUrl = await this.userStorageService.getPresignedUrl(userId);

    // Calculate expiration time (1 hour from now)
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    return {
      presignedUrl,
      expiresAt,
      message: 'Presigned URL generated successfully',
    };
  }
}
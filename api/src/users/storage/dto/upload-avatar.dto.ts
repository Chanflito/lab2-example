import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The avatar image file to upload',
  })
  file: any;
}

export class UploadAvatarResponseDto {
  @ApiProperty({
    description: 'The URL of the uploaded avatar image',
    example: 'https://yourstorageaccount.blob.core.windows.net/user-avatars/avatars/123e4567-e89b-12d3-a456-426614174000-abc123.jpg',
  })
  imageUrl: string;

  @ApiProperty({
    description: 'Success message',
    example: 'Avatar uploaded successfully',
  })
  message: string;
}
import { ApiProperty } from '@nestjs/swagger';

export class UploadUrlResponseDto {
  @ApiProperty({
    description: 'The presigned URL for direct upload to Azure Blob Storage',
    example: 'https://youraccount.blob.core.windows.net/container/avatars/user-123-uuid.jpg?sv=2022-11-02&ss=...',
  })
  uploadUrl: string;

  @ApiProperty({
    description: 'The filename that will be used for the uploaded file',
    example: 'avatars/user-123-uuid.jpg',
  })
  fileName: string;

  @ApiProperty({
    description: 'Expiration time of the upload URL',
    example: '2024-01-01T12:15:00.000Z',
  })
  expiresAt: string;

  @ApiProperty({
    description: 'HTTP method to use for upload (always PUT for Azure)',
    example: 'PUT',
  })
  method: string;

  @ApiProperty({
    description: 'Required headers for the upload',
    example: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': 'image/jpeg' },
  })
  headers: Record<string, string>;

  @ApiProperty({
    description: 'Success message',
    example: 'Upload URL generated successfully',
  })
  message: string;
}
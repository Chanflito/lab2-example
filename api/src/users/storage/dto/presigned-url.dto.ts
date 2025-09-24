import { ApiProperty } from '@nestjs/swagger';

export class PresignedUrlResponseDto {
  @ApiProperty({
    description: 'The presigned URL for accessing the avatar image',
    example: 'https://yourstorageaccount.blob.core.windows.net/user-avatars/avatars/123e4567-e89b-12d3-a456-426614174000-abc123.jpg?sv=2021-08-06&se=2023-12-01T13%3A00%3A00Z&sr=b&sp=r&sig=...',
  })
  presignedUrl: string;

  @ApiProperty({
    description: 'The expiration time of the presigned URL',
    example: '2023-12-01T13:00:00.000Z',
  })
  expiresAt: string;

  @ApiProperty({
    description: 'Success message',
    example: 'Presigned URL generated successfully',
  })
  message: string;
}
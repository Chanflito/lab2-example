import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmUploadDto {
  @ApiProperty({
    description: 'The filename that was returned from the upload URL generation',
    example: 'avatars/user-123-uuid.jpg',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;
}

export class ConfirmUploadResponseDto {
  @ApiProperty({
    description: 'The final URL of the uploaded image',
    example: 'https://youraccount.blob.core.windows.net/container/avatars/user-123-uuid.jpg',
  })
  imageUrl: string;

  @ApiProperty({
    description: 'Success message',
    example: 'Avatar upload confirmed successfully',
  })
  message: string;
}
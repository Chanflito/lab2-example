import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } from '@azure/storage-blob';
import { PrismaService } from '../../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class UserStorageService {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;
  private accountName: string;
  private accountKey: string;

  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    this.accountName = this.configService.get<string>('AZURE_STORAGE_ACCOUNT_NAME');
    this.accountKey = this.configService.get<string>('AZURE_STORAGE_ACCOUNT_KEY');
    this.containerName = this.configService.get<string>('AZURE_STORAGE_CONTAINER_NAME');

    if (!this.accountName || !this.accountKey || !this.containerName) {
      throw new Error('Azure Storage configuration is missing. Please check your environment variables.');
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, this.accountKey);
    this.blobServiceClient = new BlobServiceClient(
      `https://${this.accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );
  }

  async uploadUserAvatar(userId: string, file: any, user: { id: string; imageUrl: string | null }): Promise<string> {
    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 5MB.');
    }

    // Delete previous avatar if exists
    if (user.imageUrl) {
      await this.deleteBlobIfExists(user.imageUrl);
    }

    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `avatars/${userId}-${randomUUID()}.${fileExtension}`;

    try {
      // Get container client
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);

      // Create container if it doesn't exist (private access)
      await containerClient.createIfNotExists();

      // Get blob client and upload
      const blobClient = containerClient.getBlockBlobClient(fileName);

      await blobClient.upload(file.buffer, file.size, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
        },
      });

      // Get the blob URL
      const blobUrl = blobClient.url;

      // Update user's imageUrl in database
      await this.prismaService.user.update({
        where: { id: userId },
        data: { imageUrl: blobUrl },
      });

      return blobUrl;
    } catch (error) {
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  private async deleteBlobIfExists(imageUrl: string): Promise<void> {
    try {
      // Extract blob name from URL
      const url = new URL(imageUrl);
      const blobName = url.pathname.substring(url.pathname.indexOf('/', 1) + 1);

      // Get container client and blob client
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlockBlobClient(blobName);

      // Check if blob exists before trying to delete
      const exists = await blobClient.exists();
      if (exists) {
        await blobClient.delete();
        console.log(`🗑️ Deleted previous avatar: ${blobName}`);
      } else {
        console.log(`ℹ️ Previous avatar not found in storage: ${blobName}`);
      }
    } catch (error) {
      // Log warning but don't throw - deletion failure shouldn't prevent upload
      console.warn(`⚠️ Failed to delete previous avatar: ${error.message}`);
    }
  }

  async generateUploadPresignedUrl(userId: string, _user: { id: string; imageUrl: string | null }): Promise<{ uploadUrl: string; fileName: string }> {
    // Generate unique filename
    const fileName = `avatars/${userId}-${randomUUID()}.jpg`;

    try {
      // Generate SAS token for upload
      const sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, this.accountKey);

      const sasOptions = {
        containerName: this.containerName,
        blobName: fileName,
        permissions: BlobSASPermissions.parse('cw'), // create + write permissions
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 900 * 1000), // 15 minutes from now
      };

      const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
      const uploadUrl = `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${fileName}?${sasToken}`;

      return { uploadUrl, fileName };
    } catch (error) {
      throw new BadRequestException(`Failed to generate upload URL: ${error.message}`);
    }
  }

  async confirmUpload(userId: string, fileName: string, user: { id: string; imageUrl: string | null }): Promise<string> {

    try {
      // Verify the blob exists
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlockBlobClient(fileName);

      const exists = await blobClient.exists();
      if (!exists) {
        throw new BadRequestException('File was not uploaded successfully');
      }

      // Delete previous avatar if exists
      if (user.imageUrl) {
        await this.deleteBlobIfExists(user.imageUrl);
      }

      // Get the blob URL
      const blobUrl = blobClient.url;

      // Update user's imageUrl in database
      await this.prismaService.user.update({
        where: { id: userId },
        data: { imageUrl: blobUrl },
      });

      return blobUrl;
    } catch (error) {
      throw new BadRequestException(`Failed to confirm upload: ${error.message}`);
    }
  }

  async getPresignedUrl(userId: string, user: { id: string; imageUrl: string | null }): Promise<string> {
    if (!user.imageUrl) {
      throw new NotFoundException('User has no avatar image');
    }

    try {
      // Extract blob name from URL
      const url = new URL(user.imageUrl);
      const blobName = url.pathname.substring(url.pathname.indexOf('/', 1) + 1);

      // Generate SAS token
      const sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, this.accountKey);

      const sasOptions = {
        containerName: this.containerName,
        blobName: blobName,
        permissions: BlobSASPermissions.parse('r'), // read permission
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour from now
      };

      const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();

      return `${user.imageUrl}?${sasToken}`;
    } catch (error) {
      throw new BadRequestException(`Failed to generate presigned URL: ${error.message}`);
    }
  }
}
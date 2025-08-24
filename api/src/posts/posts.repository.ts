import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Post, Prisma } from '@prisma/client';

@Injectable()
export class PostsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.PostCreateInput): Promise<Post> {
    return this.prisma.post.create({
      data,
    });
  }

  async findAll(): Promise<Post[]> {
    return this.prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: Prisma.PostUpdateInput): Promise<Post> {
    return this.prisma.post.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<Post> {
    return this.prisma.post.delete({
      where: { id },
    });
  }

  async findPublished(): Promise<Post[]> {
    return this.prisma.post.findMany({
      where: {
        published: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private postsRepository: PostsRepository) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    return this.postsRepository.create(createPostDto);
  }

  async findAll(): Promise<Post[]> {
    return this.postsRepository.findAll();
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const existingPost = await this.postsRepository.findOne(id);
    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return this.postsRepository.update(id, updatePostDto);
  }

  async remove(id: number): Promise<Post> {
    const existingPost = await this.postsRepository.findOne(id);
    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return this.postsRepository.remove(id);
  }

  async findPublished(): Promise<Post[]> {
    return this.postsRepository.findPublished();
  }

  async publish(id: number): Promise<Post> {
    const existingPost = await this.postsRepository.findOne(id);
    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return this.postsRepository.update(id, { published: true });
  }

  async unpublish(id: number): Promise<Post> {
    const existingPost = await this.postsRepository.findOne(id);
    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return this.postsRepository.update(id, { published: false });
  }
}
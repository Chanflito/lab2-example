import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from '@prisma/client';

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

  const mockPost: Post = {
    id: 1,
    title: 'Test Post',
    content: 'Test content',
    published: false,
    createdAt: new Date(),
  };

  const mockPostsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findPublished: jest.fn(),
    publish: jest.fn(),
    unpublish: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const createPostDto = { title: 'New Post', content: 'New content' };
      mockPostsService.create.mockResolvedValue(mockPost);

      const result = await controller.create(createPostDto);

      expect(service.create).toHaveBeenCalledWith(createPostDto);
      expect(result).toEqual(mockPost);
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const posts = [mockPost];
      mockPostsService.findAll.mockResolvedValue(posts);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(posts);
    });
  });

  describe('findPublished', () => {
    it('should return published posts', async () => {
      const publishedPost = { ...mockPost, published: true };
      mockPostsService.findPublished.mockResolvedValue([publishedPost]);

      const result = await controller.findPublished();

      expect(service.findPublished).toHaveBeenCalled();
      expect(result).toEqual([publishedPost]);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      mockPostsService.findOne.mockResolvedValue(mockPost);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when post not found', async () => {
      mockPostsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const updatePostDto = { title: 'Updated Title' };
      const updatedPost = { ...mockPost, title: 'Updated Title' };
      mockPostsService.update.mockResolvedValue(updatedPost);

      const result = await controller.update(1, updatePostDto);

      expect(service.update).toHaveBeenCalledWith(1, updatePostDto);
      expect(result).toEqual(updatedPost);
    });

    it('should throw NotFoundException when updating non-existent post', async () => {
      const updatePostDto = { title: 'Updated Title' };
      mockPostsService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update(999, updatePostDto)).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(999, updatePostDto);
    });
  });

  describe('remove', () => {
    it('should remove a post', async () => {
      mockPostsService.remove.mockResolvedValue(mockPost);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when removing non-existent post', async () => {
      mockPostsService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(999);
    });
  });

  describe('publish', () => {
    it('should publish a post', async () => {
      const publishedPost = { ...mockPost, published: true };
      mockPostsService.publish.mockResolvedValue(publishedPost);

      const result = await controller.publish(1);

      expect(service.publish).toHaveBeenCalledWith(1);
      expect(result).toEqual(publishedPost);
    });

    it('should throw NotFoundException when publishing non-existent post', async () => {
      mockPostsService.publish.mockRejectedValue(new NotFoundException());

      await expect(controller.publish(999)).rejects.toThrow(NotFoundException);
      expect(service.publish).toHaveBeenCalledWith(999);
    });
  });

  describe('unpublish', () => {
    it('should unpublish a post', async () => {
      const unpublishedPost = { ...mockPost, published: false };
      mockPostsService.unpublish.mockResolvedValue(unpublishedPost);

      const result = await controller.unpublish(1);

      expect(service.unpublish).toHaveBeenCalledWith(1);
      expect(result).toEqual(unpublishedPost);
    });

    it('should throw NotFoundException when unpublishing non-existent post', async () => {
      mockPostsService.unpublish.mockRejectedValue(new NotFoundException());

      await expect(controller.unpublish(999)).rejects.toThrow(NotFoundException);
      expect(service.unpublish).toHaveBeenCalledWith(999);
    });
  });
});
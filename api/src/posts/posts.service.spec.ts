import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsRepository } from './posts.repository';
import { Post } from '@prisma/client';

describe('PostsService', () => {
  let service: PostsService;
  let repository: PostsRepository;

  const mockPost: Post = {
    id: 1,
    title: 'Test Post',
    content: 'Test content',
    published: false,
    createdAt: new Date(),
  };

  const mockPostsRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findPublished: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PostsRepository,
          useValue: mockPostsRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    repository = module.get<PostsRepository>(PostsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const createPostDto = { title: 'New Post', content: 'New content' };
      mockPostsRepository.create.mockResolvedValue(mockPost);

      const result = await service.create(createPostDto);

      expect(repository.create).toHaveBeenCalledWith(createPostDto);
      expect(result).toEqual(mockPost);
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const posts = [mockPost];
      mockPostsRepository.findAll.mockResolvedValue(posts);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(posts);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      mockPostsRepository.findOne.mockResolvedValue(mockPost);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when post not found', async () => {
      mockPostsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const updatePostDto = { title: 'Updated Title' };
      const updatedPost = { ...mockPost, title: 'Updated Title' };
      
      mockPostsRepository.findOne.mockResolvedValue(mockPost);
      mockPostsRepository.update.mockResolvedValue(updatedPost);

      const result = await service.update(1, updatePostDto);

      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, updatePostDto);
      expect(result).toEqual(updatedPost);
    });

    it('should throw NotFoundException when updating non-existent post', async () => {
      const updatePostDto = { title: 'Updated Title' };
      mockPostsRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updatePostDto)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith(999);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a post', async () => {
      mockPostsRepository.findOne.mockResolvedValue(mockPost);
      mockPostsRepository.remove.mockResolvedValue(mockPost);

      const result = await service.remove(1);

      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(repository.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when removing non-existent post', async () => {
      mockPostsRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith(999);
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });

  describe('findPublished', () => {
    it('should return published posts', async () => {
      const publishedPost = { ...mockPost, published: true };
      mockPostsRepository.findPublished.mockResolvedValue([publishedPost]);

      const result = await service.findPublished();

      expect(repository.findPublished).toHaveBeenCalled();
      expect(result).toEqual([publishedPost]);
    });
  });

  describe('publish', () => {
    it('should publish a post', async () => {
      const publishedPost = { ...mockPost, published: true };
      
      mockPostsRepository.findOne.mockResolvedValue(mockPost);
      mockPostsRepository.update.mockResolvedValue(publishedPost);

      const result = await service.publish(1);

      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, { published: true });
      expect(result).toEqual(publishedPost);
    });

    it('should throw NotFoundException when publishing non-existent post', async () => {
      mockPostsRepository.findOne.mockResolvedValue(null);

      await expect(service.publish(999)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith(999);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('unpublish', () => {
    it('should unpublish a post', async () => {
      const unpublishedPost = { ...mockPost, published: false };
      
      mockPostsRepository.findOne.mockResolvedValue(mockPost);
      mockPostsRepository.update.mockResolvedValue(unpublishedPost);

      const result = await service.unpublish(1);

      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, { published: false });
      expect(result).toEqual(unpublishedPost);
    });

    it('should throw NotFoundException when unpublishing non-existent post', async () => {
      mockPostsRepository.findOne.mockResolvedValue(null);

      await expect(service.unpublish(999)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith(999);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  // THIS TEST WILL FAIL - intentionally for demonstration
  describe('failing test example', () => {
    it('should fail - demonstrating a failing test', async () => {
      // This test is designed to fail
      const result = await service.findAll();
      expect(result).toHaveLength(5); // This will fail since we mock to return 1 post
    });
  });
});
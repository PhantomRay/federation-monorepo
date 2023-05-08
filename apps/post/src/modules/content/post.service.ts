import { Injectable } from '@nestjs/common';

import { Post } from './posts.interfaces';

@Injectable()
export class PostService {
  private posts: Post[] = [
    { id: 1, title: 'Post 1', authorId: 1 },
    { id: 2, title: 'Post 2', authorId: 1 },
    { id: 3, title: 'Post 3', authorId: 2 }
  ];

  findOne(postId: number) {
    return this.posts.find((post) => post.id === postId);
  }

  findOneByAuthorId(authorId: number) {
    return this.posts.filter((post) => post.authorId === Number(authorId));
  }

  findAll() {
    return this.posts;
  }
}
